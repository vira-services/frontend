import {
  ActivityType,
  type Presence,
  type Activity as DjActivity,
} from "discord.js";
import type {
  Activity,
  DiscordEmoji,
  DiscordMember,
  DiscordPresenceData,
  DiscordUser,
  PresenceStatus,
} from "./types.js";

type DjEmoji = DjActivity["emoji"];

const ACTIVITY_TYPE_NAMES: Record<number, Activity["type"]> = {
  [ActivityType.Playing]: "Playing",
  [ActivityType.Streaming]: "Streaming",
  [ActivityType.Listening]: "Listening",
  [ActivityType.Watching]: "Watching",
  [ActivityType.Custom]: "Custom",
  [ActivityType.Competing]: "Competing",
};

function assetUrl(applicationId: string | null, assetId: string): string {
  return `https://cdn.discordapp.com/app-assets/${applicationId}/${assetId}.png`;
}

function buildEmojiUrl(
  id: string | null,
  animated: boolean,
): string | null {
  if (!id) return null;
  return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}?size=48`;
}

function mapEmoji(emoji: DjEmoji | null | undefined): DiscordEmoji | null {
  if (!emoji) return null;
  const animated = emoji.animated ?? false;
  return {
    name: emoji.name ?? "",
    id: emoji.id ?? null,
    animated,
    url: buildEmojiUrl(emoji.id, animated),
  };
}

function mapAssetUrl(
  raw: string | null | undefined,
  applicationId: string | null,
): string | null {
  if (!raw) return null;
  if (/^https?:\/\//.test(raw)) return raw;
  if (applicationId) return assetUrl(applicationId, raw);
  return null;
}

interface JsAssets {
  largeImage?: string | null;
  largeText?: string | null;
  smallImage?: string | null;
  smallText?: string | null;
}

function mapAssets(
  assets: JsAssets | null,
  applicationId: string | null,
): Activity["assets"] {
  if (!assets) return null;
  return {
    largeImage: mapAssetUrl(assets.largeImage, applicationId),
    largeText: assets.largeText ?? null,
    smallImage: mapAssetUrl(assets.smallImage, applicationId),
    smallText: assets.smallText ?? null,
  };
}

function mapActivity(activity: DjActivity): Activity | null {
  const typeName = ACTIVITY_TYPE_NAMES[activity.type];
  if (!typeName) return null;

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
            ? ([activity.party.size[0], activity.party.size[1]] as [
                number,
                number,
              ])
            : null,
        }
      : null,
    assets: mapAssets(activity.assets, applicationId),
    emoji: mapEmoji(activity.emoji),
    buttons: (activity.buttons as string[]) ?? [],
    syncId: activity.syncId ?? null,
    sessionId: null,
    flags: Array.isArray(activity.flags)
      ? activity.flags.map(String)
      : activity.flags && typeof activity.flags.toArray === "function"
        ? activity.flags.toArray().map(String)
        : [],
  };
}

function mapStatus(presence: Presence): PresenceStatus | null {
  if (!presence.status) return null;

  let status: PresenceStatus["status"];
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

  const custom = presence.activities.find(
    (a) => a.type === ActivityType.Custom,
  );

  return {
    status,
    clientStatus: presence.clientStatus ?? null,
    description:
      custom && custom.state
        ? {
            text: custom.state,
            createdTimestamp: custom.createdAt?.getTime() ?? Date.now(),
            emoji: mapEmoji(custom.emoji),
          }
        : null,
  };
}

function mapUser(user: Presence["user"]): DiscordUser | null {
  if (!user) return null;
  const pub = user as {
    bannerColor?: number | null;
    publicFlags?: { bitfield: number } | null;
    avatarDecorationURL?: (options?: { size?: number }) => string | null;
  };
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

function mapMember(presence: Presence): DiscordMember | null {
  const member = presence.member;
  if (!member) return null;
  return {
    nickname: member.nickname ?? null,
    displayName: member.displayName ?? null,
    joinedAt: member.joinedAt ? member.joinedAt.toISOString() : "",
  };
}

function mapRoles(presence: Presence): string[] {
  const member = presence.member;
  if (!member) return [];
  return member.roles.cache
    .filter((role) => role.name !== "@everyone")
    .map((role) => role.name);
}

function mapRoleIds(presence: Presence): string[] {
  const member = presence.member;
  if (!member) return [];
  return member.roles.cache
    .filter((role) => role.name !== "@everyone")
    .map((role) => role.id);
}

function mapClan(
  presence: Presence,
  clanTag: string | null,
  clanBadge: string | null,
): DiscordPresenceData["clan"] {
  const member = presence.member;
  const guildId = member?.guild?.id ?? null;
  if (!member || !guildId) return null;

  const tag = clanTag?.toLowerCase() === "vira" ? clanTag : null;

  return {
    guildId,
    enabled: !!tag,
    tag: tag ?? "",
    badge: clanBadge ?? "",
  };
}

export function buildPresenceData(
  presence: Presence,
  options: { clanTag: string | null; clanBadge: string | null },
): DiscordPresenceData {
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
      .filter((a): a is Activity => a !== null),
    roles: mapRoles(presence),
    roleIds: mapRoleIds(presence),
  };
}
