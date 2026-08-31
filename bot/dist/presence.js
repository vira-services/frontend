import { ActivityType, } from "discord.js";
const ACTIVITY_TYPE_NAMES = {
    [ActivityType.Playing]: "Playing",
    [ActivityType.Streaming]: "Streaming",
    [ActivityType.Listening]: "Listening",
    [ActivityType.Watching]: "Watching",
    [ActivityType.Custom]: "Custom",
    [ActivityType.Competing]: "Competing",
};
function assetUrl(applicationId, assetId) {
    return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png`;
}
function buildEmojiUrl(id, animated) {
    if (!id)
        return null;
    return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=48`;
}
function mapEmoji(emoji) {
    if (!emoji)
        return null;
    const animated = emoji.animated ?? false;
    return {
        name: emoji.name ?? "",
        id: emoji.id ?? null,
        animated,
        url: buildEmojiUrl(emoji.id, animated),
    };
}
function mapAssetUrl(raw, applicationId) {
    if (!raw)
        return null;
    if (/^https?:\/\//.test(raw))
        return raw;
    if (applicationId)
        return assetUrl(applicationId, raw);
    return null;
}
function mapAssets(assets, applicationId) {
    if (!assets)
        return null;
    return {
        largeImage: mapAssetUrl(assets.largeImage, applicationId),
        largeText: assets.largeText ?? null,
        smallImage: mapAssetUrl(assets.smallImage, applicationId),
        smallText: assets.smallText ?? null,
    };
}
function mapActivity(activity) {
    const typeName = ACTIVITY_TYPE_NAMES[activity.type];
    if (!typeName)
        return null;
    const applicationId = activity.applicationId ?? null;
    return {
        name: activity.name,
        type: typeName,
        details: activity.details ?? null,
        state: activity.state ?? null,
        url: activity.url ?? null,
        applicationId,
        createdTimestamp: activity.createdAt?.getTime() ?? Date.now(),
        timestamps: activity.timestamps
            ? {
                start: activity.timestamps.start
                    ? activity.timestamps.start.getTime()
                    : null,
                end: activity.timestamps.end
                    ? activity.timestamps.end.getTime()
                    : null,
            }
            : null,
        party: activity.party
            ? {
                id: activity.party.id ?? "",
                size: activity.party.size
                    ? [activity.party.size[0], activity.party.size[1]]
                    : null,
            }
            : null,
        assets: mapAssets(activity.assets, applicationId),
        emoji: mapEmoji(activity.emoji),
        buttons: activity.buttons ?? [],
        syncId: activity.syncId ?? null,
        sessionId: null,
        flags: Array.isArray(activity.flags)
            ? activity.flags.map(String)
            : activity.flags && typeof activity.flags.toArray === "function"
                ? activity.flags.toArray().map(String)
                : [],
    };
}
function mapStatus(presence) {
    if (!presence.status)
        return null;
    let status;
    switch (presence.status) {
        case "online":
        case "idle":
        case "dnd":
        case "invisible":
            status = presence.status;
            break;
        default:
            status = "invisible";
    }
    const custom = presence.activities.find((a) => a.type === ActivityType.Custom);
    return {
        status,
        clientStatus: presence.clientStatus ?? null,
        description: custom && custom.state
            ? {
                text: custom.state,
                createdTimestamp: custom.createdAt?.getTime() ?? Date.now(),
                emoji: mapEmoji(custom.emoji),
            }
            : null,
    };
}
function mapUser(user) {
    if (!user)
        return null;
    const pub = user;
    return {
        id: user.id,
        username: user.username,
        globalName: user.globalName ?? null,
        discriminator: user.discriminator === "0" ? "#0" : user.discriminator,
        bot: user.bot,
        system: user.system,
        avatar: user.avatarURL({ size: 128, forceStatic: false }),
        banner: user.bannerURL({ size: 512 }) ?? null,
        accentColor: user.accentColor ?? null,
        bannerColor: pub.bannerColor ?? null,
        avatarDecoration: pub.avatarDecorationURL?.({ size: 128 }) ?? null,
        publicFlags: pub.publicFlags?.bitfield ?? 0,
    };
}
function mapMember(presence) {
    const member = presence.member;
    if (!member)
        return null;
    return {
        nickname: member.nickname ?? null,
        displayName: member.displayName ?? null,
        joinedAt: member.joinedAt ? member.joinedAt.toISOString() : "",
    };
}
function mapRoles(presence) {
    const member = presence.member;
    if (!member)
        return [];
    return member.roles.cache
        .filter((role) => role.name !== "@everyone")
        .map((role) => role.name);
}
function mapRoleIds(presence) {
    const member = presence.member;
    if (!member)
        return [];
    return member.roles.cache
        .filter((role) => role.name !== "@everyone")
        .map((role) => role.id);
}
function mapClan(presence, clanTag, clanBadge) {
    const member = presence.member;
    const guildId = member?.guild?.id ?? null;
    if (!member || !guildId)
        return null;
    const tag = clanTag?.toLowerCase() === "vira" ? clanTag : null;
    return {
        guildId,
        enabled: !!tag,
        tag: tag ?? "",
        badge: clanBadge ?? "",
    };
}
export function buildPresenceData(presence, options) {
    const user = mapUser(presence.user);
    if (!user) {
        return {
            user: {
                id: presence.user?.id ?? "",
                username: "",
                globalName: null,
                discriminator: "#0",
                bot: false,
                system: false,
                avatar: null,
                banner: null,
                accentColor: null,
                bannerColor: null,
                avatarDecoration: null,
                publicFlags: 0,
            },
            clan: null,
            member: null,
            status: null,
            activities: [],
            roles: [],
            roleIds: [],
        };
    }
    return {
        user,
        clan: mapClan(presence, options.clanTag, options.clanBadge),
        member: mapMember(presence),
        status: mapStatus(presence),
        activities: presence.activities
            .map(mapActivity)
            .filter((a) => a !== null),
        roles: mapRoles(presence),
        roleIds: mapRoleIds(presence),
    };
}
