import { ButtonStyle, MessageFlags, PermissionFlagsBits, } from "discord.js";
import { insertClaim, getClaimedLetters, getClaimByDiscordId, } from "./claimsDb.js";
const CLAIM_BUTTON_PREFIX = "claim_1l_";
const PANEL_CONTENT = "## Claim Your 1L Before Release\n\n" +
    "**You only can claim one, please don't ask in tickets if you can claim another one.**\n" +
    "-# 1L will be given once released when you sign up.";
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
function createLetterRows(claimed) {
    const rows = [];
    for (let i = 0; i < LETTERS.length; i += 5) {
        const letters = LETTERS.slice(i, i + 5);
        rows.push({
            type: 1,
            components: letters.map((letter) => {
                const isClaimed = claimed.includes(letter);
                return {
                    type: 2,
                    style: ButtonStyle.Secondary,
                    label: letter.toUpperCase(),
                    custom_id: `${CLAIM_BUTTON_PREFIX}${letter}`,
                    disabled: isClaimed,
                };
            }),
        });
    }
    return rows;
}
// ============================================================
// !1L COMMAND
// ADMIN ONLY
// ============================================================
export async function handleMessage(message) {
    if (message.author.bot)
        return;
    console.log(`[1l] message from ${message.author.tag}: "${message.content}"`);
    // Only respond to !1l
    if (message.content.trim().toLowerCase() !== "!1l")
        return;
    // Admin only
    if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) {
        await message.delete().catch(() => { });
        return;
    }
    try {
        // Delete the command message automatically
        await message.delete().catch(() => { });
        const claimed = await getClaimedLetters();
        const channel = message.channel;
        if (!("send" in channel))
            return;
        await channel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: PANEL_CONTENT,
                        },
                        ...createLetterRows(claimed),
                    ],
                },
            ],
        });
    }
    catch (error) {
        console.error("Failed to send 1L panel:", error);
    }
}
// ============================================================
// 1L LETTER BUTTONS
// ============================================================
export async function handleInteraction(interaction) {
    if (interaction.isButton() &&
        interaction.customId.startsWith(CLAIM_BUTTON_PREFIX)) {
        const letter = interaction.customId
            .replace(CLAIM_BUTTON_PREFIX, "")
            .toLowerCase();
        const discordId = interaction.user.id;
        try {
            // Make sure the letter is valid
            if (!LETTERS.includes(letter)) {
                await interaction.reply({
                    content: "That is not a valid 1L.",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            // Check if user already has a claim
            const existing = await getClaimByDiscordId(discordId);
            if (existing) {
                await interaction.reply({
                    content: `You've already claimed a 1L (\`${existing.letter.toUpperCase()}\`).`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            // Check if letter is already claimed
            const claimed = await getClaimedLetters();
            if (claimed.includes(letter)) {
                await interaction.reply({
                    content: `\`${letter.toUpperCase()}\` has already been claimed.`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            // Attempt claim
            const result = await insertClaim(discordId, letter);
            if (result === "already_claimed") {
                await interaction.reply({
                    content: "You've already claimed a 1L.",
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            if (result === "taken") {
                await interaction.reply({
                    content: `Sorry, \`${letter.toUpperCase()}\` was just claimed by someone else.`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            // Successful claim
            await interaction.reply({
                content: `## 1L Claimed!\n\n` +
                    `Your one-letter alias **\`${letter.toUpperCase()}\`** has been reserved.\n\n` +
                    `-# Your alias will be applied once released when you sign up.`,
                flags: MessageFlags.Ephemeral,
            });
            console.log(`${interaction.user.tag} (${discordId}) claimed /${letter}`);
        }
        catch (error) {
            console.error("1L claim interaction error:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "Something went wrong while processing your claim. Please try again.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
        return;
    }
}
