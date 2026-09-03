import { db } from "@/db";
import {
  auditLogsTable,
  usernameBansTable,
} from "@/db/schemas";
import { requireAdmin } from "@/lib/admin";
import { handleServerErrors, ViraError } from "@/lib/error";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logToDiscord } from "@/lib/api/utils/discordLog";

export async function GET() {
  try {
    await requireAdmin();
    const bans = await db
      .select({
        id: usernameBansTable.id,
        username: usernameBansTable.username,
        reason: usernameBansTable.reason,
        bannedBy: usernameBansTable.bannedBy,
        createdAt: usernameBansTable.createdAt,
      })
      .from(usernameBansTable)
      .orderBy(desc(usernameBansTable.createdAt));
    return NextResponse.json({ bans });
  } catch (error) {
    return handleServerErrors(error);
  }
}

const banSchema = z.object({
  username: z.string().min(1).max(255),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    const body = await req.json();
    const parsed = banSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const username = parsed.data.username.trim().toLowerCase();
    if (!username) throw new ViraError("Username is required", 400);

    const [existing] = await db
      .select({ id: usernameBansTable.id })
      .from(usernameBansTable)
      .where(eq(usernameBansTable.username, username))
      .limit(1);
    if (existing) throw new ViraError("Username is already banned", 409);

    await db.insert(usernameBansTable).values({
      username,
      reason: parsed.data.reason || null,
      bannedBy: adminId,
    });

    await db.insert(auditLogsTable).values({
      action: "username_ban",
      performedBy: adminId,
    });

    void logToDiscord({
      title: "🚫 Admin: username banned",
      color: "danger",
      fields: [
        { name: "Username", value: username, inline: true },
        { name: "By", value: adminId, inline: true },
        ...(parsed.data.reason
          ? [{ name: "Reason", value: parsed.data.reason, inline: true }]
          : []),
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new ViraError("Missing id", 400);

    const [ban] = await db
      .select({ username: usernameBansTable.username })
      .from(usernameBansTable)
      .where(eq(usernameBansTable.id, id));
    if (!ban) throw new ViraError("Ban not found", 404);

    await db.delete(usernameBansTable).where(eq(usernameBansTable.id, id));

    await db.insert(auditLogsTable).values({
      action: "username_unban",
      performedBy: adminId,
    });

    void logToDiscord({
      title: "⚙️ Admin: username unbanned",
      color: "info",
      fields: [
        { name: "Username", value: ban.username, inline: true },
        { name: "By", value: adminId, inline: true },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServerErrors(error);
  }
}
