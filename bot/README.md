# Vira Presence Bot

Standalone Discord bot that tracks member presence, activities, and guild
membership in real time and serves it over an HTTP API. This is the service
behind `discord.vira.wtf` used by the Vira app's Discord profile widget and
badge/role sync.

## What it does

- Connects to Discord's gateway with the **Guild Presences** and **Guild
  Members** intents.
- Caches each member's:
  - user profile (avatar, banner, global name, decoration, etc.)
  - presence status + custom status
  - rich activities (name, type, timestamps, assets, emoji, buttons)
  - guild member info (nickname, display name, joined at)
  - role **names** (used by Vira's badge/role sync)
  - clan/guild tag + badge
- Serves a live per-user JSON payload via `GET /:discordUserId`.
- Registers a **`/1l`** slash command that shows a Components V2 panel (one-letter
  alias "Claim Your 1L") with a claim button. Claims reserve a single-letter
  alias (a–z) per user, persisted to the shared Vira Postgres database so the
  app can auto-apply the alias on Discord link.

## Endpoint

`GET /:discordUserId` → returns:

```ts
{
  user: {
    id, username, globalName, discriminator, bot, system,
    avatar, banner, accentColor, bannerColor, avatarDecoration, publicFlags
  },
  clan: { guildId, enabled, tag, badge } | null,
  member: { nickname, displayName, joinedAt } | null,
  status: {
    status, // "online" | "idle" | "dnd" | "invisible"
    clientStatus, // { desktop?, mobile?, web? } | null
    description: { text, createdTimestamp, emoji } | null
  } | null,
  activities: Activity[],
  roles: string[]
}
```

`GET /health` returns liveness info.

## Setup

1. Create a Discord application and add a bot user with these **bot intents**
   enabled in the Developer Portal → Bot → Privileged Gateway Intents:
   - **Server Members Intent**
   - **Presence Intent** (eligible-bot only)
2. Invite the bot to your server with the required permissions.

3. Create `bot/.env`:

   ```env
   DISCORD_TOKEN=your-bot-token
   DISCORD_GUILDID=your-guild-id
   CLAN_TAG=Vira        # optional; enables the guild tag on profiles when set to "Vira"
   CLAN_BADGE=           # optional clan badge image URL
   PORT=3001
   DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```

   `DATABASE_URL` is the same connection string as the Vira app's — it is
   required for the `/1l` claim feature (writes to the `claims` table).

4. Run:

   ```sh
   cd bot
   bun install
   bun run dev          # or: bun run build && bun start
   ```

5. Point `discord.vira.wtf` (via Cloudflare Tunnel / reverse proxy) at the bot
   port (default `3001`).

## Notes

- The Vira Next.js app calls `http://discord.vira.wtf/{id}` and expects the raw
  payload above. No `data` wrapper is added by the bot.
- Offline members without a live presence still get a user/member/roles payload
  (status and activities are `null`/`[]`).
- This bot is a separate service from the main app; deploy it independently.
