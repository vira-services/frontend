import { db } from "@/db";
import { connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors } from "@/lib/error";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logToDiscord } from "@/lib/api/utils/discordLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .delete(connectionsTable)
      .where(
        and(
          eq(connectionsTable.userId, session.userId),
          eq(connectionsTable.providerType, "discord"),
        ),
      )
      .returning({ id: connectionsTable.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Discord is not connected" },
        { status: 404 },
      );
    }

    void logToDiscord({
      title: "🔌 Discord disconnected",
      color: "warning",
      fields: [{ name: "User ID", value: session.userId, inline: true }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServerErrors(error);
  }
}
