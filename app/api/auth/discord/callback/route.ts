import { db } from "@/db";
import { connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { getAppOrigin, getDiscordRedirectUri } from "@/lib/app-url";
import { applyClaimedAliasByDiscordId } from "@/lib/claims/applyClaim";
import { logToDiscord } from "@/lib/api/utils/discordLog";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth", getAppOrigin(req)));
    }

    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=missing_code", getAppOrigin(req)),
      );
    }

    const clientId = process.env.DISCORD_CLIENTID;
    const clientSecret = process.env.DISCORD_CLIENTSECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Discord environment variables are not configured");
    }

    const redirectUri = getDiscordRedirectUri(req);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Discord token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=token_exchange_failed", getAppOrigin(req)),
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=user_fetch_failed", getAppOrigin(req)),
      );
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.username;

    // discord connections are oauth-only here (no ongoing api calls),
    // so we don't persist the access/refresh tokens
    await db
      .insert(connectionsTable)
      .values({
        userId: session.userId,
        providerType: "discord",
        accountId: discordId,
      })
      .onConflictDoUpdate({
        target: [connectionsTable.userId, connectionsTable.providerType],
        set: {
          accountId: discordId,
          updatedAt: new Date(),
        },
      });

    // Auto-apply the claimed 1L alias (single-letter url) if the linked
    // discord account has a reservation.
    try {
      await applyClaimedAliasByDiscordId(session.userId, discordId);
    } catch (err) {
      console.error("Failed to apply claimed 1L alias:", err);
    }

    void logToDiscord({
      title: "🔗 Discord connected",
      color: "success",
      fields: [
        { name: "Discord", value: `${discordUsername} (${discordId})`, inline: true },
        { name: "User ID", value: session.userId, inline: true },
      ],
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?discord_connected=true", getAppOrigin(req)),
    );
  } catch (error) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=unknown", getAppOrigin(req)),
    );
  }
}
