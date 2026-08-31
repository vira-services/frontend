import { db } from "@/db";
import {
  aliasesTable,
  aliasTokensTable,
  usersTable,
} from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, ViraError } from "@/lib/error";
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logToDiscord } from "@/lib/api/utils/discordLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new ViraError("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const alias =
      typeof body.alias === "string" ? body.alias.trim().toLowerCase() : "";

    if (!token) throw new ViraError("Token is required", 400);
    if (!alias) throw new ViraError("Alias is required", 400);

    // Alias must be a valid, reasonably short slug (single path segment).
    if (alias.length > 64 || !/^[a-z0-9][a-z0-9-_]*$/.test(alias)) {
      throw new ViraError(
        "Alias may only contain letters, numbers, dashes and underscores",
        400,
      );
    }

    // Claimed 1L letters + reserved system urls are off-limits as free aliases.
    if (/^[a-z]$/.test(alias)) {
      throw new ViraError("Single-letter aliases require a 1L claim", 400);
    }

    const [tokenRow] = await db
      .select({
        id: aliasTokensTable.id,
        redeemedBy: aliasTokensTable.redeemedBy,
      })
      .from(aliasTokensTable)
      .where(eq(aliasTokensTable.code, token))
      .limit(1);
    if (!tokenRow) throw new ViraError("Invalid token", 400);
    if (tokenRow.redeemedBy) throw new ViraError("Token already used", 400);

    // Ensure the alias is not already taken as an alias, main url, or username.
    const [taken] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .leftJoin(aliasesTable, eq(aliasesTable.alias, alias))
      .where(
        or(
          eq(usersTable.url, alias),
          eq(usersTable.username, alias),
          eq(aliasesTable.alias, alias),
        ),
      )
      .limit(1);
    if (taken) throw new ViraError("That alias is already taken", 409);

    const [granted] = await db
      .insert(aliasesTable)
      .values({ userId: session.userId, alias })
      .returning({ alias: aliasesTable.alias, id: aliasesTable.id });
    if (!granted) throw new ViraError("Failed to add alias", 500);

    await db
      .update(aliasTokensTable)
      .set({
        redeemedBy: session.userId,
        grantedAlias: alias,
        redeemedAt: new Date(),
      })
      .where(eq(aliasTokensTable.id, tokenRow.id));

    void logToDiscord({
      title: "🎟️ Alias token redeemed",
      color: "success",
      fields: [
        { name: "User ID", value: session.userId, inline: true },
        { name: "Alias", value: alias, inline: true },
      ],
    });

    return NextResponse.json(
      { success: true, alias: granted.alias },
      { status: 200 },
    );
  } catch (error) {
    return handleServerErrors(error);
  }
}
