import { db } from "@/db";
import { badgesTable, connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, ViraError } from "@/lib/error";
import { BADGE_CONFIG, getColor } from "@/lib/badges";
import { applyClaimedAliasByDiscordId } from "@/lib/claims/applyClaim";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const PRESENCE_DISCORD_API = "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new ViraError("Unauthorized", 401);

    const [connection] = await db
      .select({ discordId: connectionsTable.accountId })
      .from(connectionsTable)
      .where(
        and(
          eq(connectionsTable.userId, session.userId),
          eq(connectionsTable.providerType, "discord")
        )
      );

    if (!connection || !connection.discordId) {
      throw new ViraError("Discord account is not connected", 400);
    }

    const res = await fetch(`${PRESENCE_DISCORD_API}/${connection.discordId}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new ViraError("Discord user not found on the server", res.status);
    }

    const discordData = await res.json();
    const roleIds: string[] =
      discordData?.data?.roleIds || discordData?.roleIds || [];

    if (!Array.isArray(roleIds)) {
      throw new ViraError("Invalid roles format from Discord API", 500);
    }

    // Map Discord role ids -> badge config keys.
    const ROLE_ID_TO_BADGE: Record<string, string> = {
      "1543769790030544998": "og", // @OG
      "1543769805176447016": "verified", // @Verified
      "1543769835899457566": "bug_hunter", // @Bug Hunter
      // "1543769820841902161": "early", // @Early - no badge config yet
      // "1543769856162267146": "inventor", // @Inventor - no badge config yet
    };

    const matchedBadges = Array.from(
      new Set(
        roleIds.map((id) => ROLE_ID_TO_BADGE[id]).filter((id) => !!id),
      ),
    );

    const hasGuildTag =
      discordData?.data?.clan?.tag?.toLowerCase() === "Vira" ||
      discordData?.clan?.tag?.toLowerCase() === "Vira";

    const existingBadges = await db
      .select({ icon: badgesTable.icon })
      .from(badgesTable)
      .where(eq(badgesTable.userId, session.userId));

    const existingIcons = new Set(existingBadges.map((b) => b.icon));
    let addedCount = 0;

    const currentBadges = await db
      .select({ position: badgesTable.position })
      .from(badgesTable)
      .where(eq(badgesTable.userId, session.userId))
      .orderBy(badgesTable.position);

    let nextPosition = currentBadges.length;

    for (const key of matchedBadges) {
      const config = BADGE_CONFIG[key];
      if (!config) continue;
      const iconValue = key === "og" ? "og_users" : key;

      if (!existingIcons.has(iconValue) && !existingIcons.has(key)) {
        await db
          .insert(badgesTable)
          .values({
            userId: session.userId,
            name: config.name,
            icon: iconValue,
            icon_color: getColor(key),
            position: nextPosition,
          });
        nextPosition++;
        addedCount++;
        existingIcons.add(iconValue);
      }
    }

    if (hasGuildTag && !existingIcons.has("guild_tag")) {
      const config = BADGE_CONFIG.guild_tag;
      if (config) {
        await db
          .insert(badgesTable)
          .values({
            userId: session.userId,
            name: config.name,
            icon: "guild_tag",
            icon_color: getColor("guild_tag"),
            position: nextPosition,
          });
        nextPosition++;
        addedCount++;
        existingIcons.add("guild_tag");
      }
    }

    // Apply the claimed 1L alias (single-letter url) if the linked discord
    // account has a reservation.
    try {
      await applyClaimedAliasByDiscordId(session.userId, connection.discordId);
    } catch (err) {
      console.error("Failed to apply claimed 1L alias:", err);
    }

    return NextResponse.json(
      { success: true, added: addedCount, matchedBadges },
      { status: 200 },
    );
  } catch (error) {
    return handleServerErrors(error);
  }
}
