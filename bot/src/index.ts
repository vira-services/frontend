import "dotenv/config";
import http from "node:http";
import {
  Client,
  Events,
  GatewayIntentBits,
  ActivityType,
} from "discord.js";
import {
  setUser,
  getUser,
  deleteUser,
  setPresenceRef,
  getPresenceRef,
} from "./cache.js";
import { buildPresenceData } from "./presence.js";
import type { DiscordPresenceData, DiscordUser } from "./types.js";
import { handleMessage, handleInteraction } from "./1l.js";

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILDID;
const PORT = Number(process.env.PORT || 3001);
const CLAN_TAG = process.env.CLAN_TAG ?? null;
const CLAN_BADGE = process.env.CLAN_BADGE ?? null;

if (!TOKEN) {
  console.error("DISCORD_TOKEN is not set");
  process.exit(1);
}
if (!GUILD_ID) {
  console.error("DISCORD_GUILDID is not set");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    activities: [{ name: "vira", type: ActivityType.Watching }],
    status: "online",
  },
});

function updateFromPresence(presence: import("discord.js").Presence) {
  if (!presence.user) return;
  const data = buildPresenceData(presence, { clanTag: CLAN_TAG, clanBadge: CLAN_BADGE });
  setUser(presence.user.id, {
    data,
    metadata: {
      roleNames: data.roles,
      guildId: presence.member?.guild?.id ?? null,
    },
  });
  setPresenceRef(presence.user.id, presence);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Logged in as ${c.user?.tag}`);

  const guild = client.guilds.cache.get(GUILD_ID!);
  if (!guild) {
    console.error(`Guild ${GUILD_ID} not found`);
    return;
  }

  // Preload existing members so offline members still have profile/guild data.
  try {
    const members = await guild.members.fetch();
    let withPresence = 0;
    let offline = 0;
    for (const member of members.values()) {
      const presence = member.presence;
      if (presence) {
        updateFromPresence(presence);
        withPresence++;
      } else {
        offline++;
      }
    }
    console.log(`Preloaded ${members.size} members (${withPresence} with presence, ${offline} offline)`);
  } catch (err) {
    console.error("Failed to preload members:", err);
  }

  startServer();
});

client.on(Events.MessageCreate, (message) => {
  handleMessage(message).catch((err) => {
    console.error("Message command error:", err);
  });
});

client.on(Events.InteractionCreate, (interaction) => {
  handleInteraction(interaction).catch((err) => {
    console.error("Interaction error:", err);
  });
});

client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
  if (!newPresence) return;
  try {
    updateFromPresence(newPresence);
  } catch (err) {
    console.error("presence update error:", err);
  }
});

client.on(Events.GuildMemberAdd, async (member) => {
  // member.presence may not be populated right away
  const data = memberPresenceFallback(member);
  setUser(member.id, { data, metadata: { roleNames: data.roles, guildId: member.guild.id } });
});

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
  // roles/nickname changed; refresh payload from presence if present
  const presence = getPresenceRef(newMember.id);
  if (presence) {
    updateFromPresence(presence);
  } else {
    const data = memberPresenceFallback(newMember);
    setUser(newMember.id, {
      data,
      metadata: {
        roleNames: data.roles,
        guildId: newMember.guild.id,
      },
    });
  }
});

client.on(Events.GuildMemberRemove, (member) => {
  deleteUser(member.id);
});

function startServer() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, cached: client.users.cache.size }));
      return;
    }

    const id = decodeURIComponent(url.pathname.slice(1));
    if (!id) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing Discord ID" }));
      return;
    }

    const cached = getUser(id);
    if (cached) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(cached.data));
      return;
    }

    // Try live lookup against the guild members
    try {
      const member = await client.guilds.cache.get(GUILD_ID!)?.members.fetch(id);
      if (member) {
        const presence = member.presence;
        const payload = presence
          ? buildPresenceData(presence, { clanTag: CLAN_TAG, clanBadge: CLAN_BADGE })
          : memberPresenceFallback(member);
        setUser(id, { data: payload, metadata: { roleNames: payload.roles, guildId: GUILD_ID ?? null } });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
        return;
      }
    } catch {
      // member doesn't exist in the guild, fall through to 404
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Discord user not found" }));
  });

  server.listen(PORT, () => {
    console.log(`Presence service listening on :${PORT}`);
  });
}

function memberPresenceFallback(
  member: import("discord.js").GuildMember,
): DiscordPresenceData {
  const user = member.user;
  const pub = user as {
    publicFlags?: { bitfield: number } | null;
    bannerColor?: number | null;
  };
  const u: DiscordUser = {
    id: user.id,
    username: user.username,
    globalName: user.globalName ?? null,
    discriminator: user.discriminator === "0" ? "#0" : user.discriminator,
    bot: user.bot,
    system: user.system,
    avatar: user.avatarURL({ size: 128, forceStatic: false }) ?? null,
    banner: user.bannerURL({ size: 512 }) ?? null,
    accentColor: user.accentColor ?? null,
    bannerColor: pub.bannerColor ?? null,
    avatarDecoration: user.avatarDecorationURL?.({ size: 128 }) ?? null,
    publicFlags: pub.publicFlags?.bitfield ?? 0,
  };
  const roles = member.roles.cache
    .filter((r) => r.name !== "@everyone")
    .map((r) => r.name);
  const roleIds = member.roles.cache
    .filter((r) => r.name !== "@everyone")
    .map((r) => r.id);
  return {
    user: u,
    clan: null,
    member: {
      nickname: member.nickname ?? null,
      displayName: member.displayName ?? null,
      joinedAt: member.joinedAt ? member.joinedAt.toISOString() : "",
    },
    status: null,
    activities: [],
    roles,
    roleIds,
  };
}

client.login(TOKEN);
