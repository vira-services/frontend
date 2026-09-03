import { db } from "@/db";
import { auditLogsTable, sessionsTable, usersTable } from "@/db/schemas";
import { requireAdmin } from "@/lib/admin";
import { handleServerErrors, ViraError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { logToDiscord } from "@/lib/api/utils/discordLog";

const schema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const [target] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        admin: usersTable.admin,
        superadmin: usersTable.superadmin,
        owner: usersTable.owner,
      })
      .from(usersTable)
      .where(eq(usersTable.id, parsed.data.userId));
    if (!target) throw new ViraError("User not found", 404);
    if (target.admin || target.superadmin || target.owner) {
      throw new ViraError("Cannot reset another staff account's password", 403);
    }

    const hashed = await argon2.hash(parsed.data.newPassword);
    await db
      .update(usersTable)
      .set({
        password: hashed,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      })
      .where(eq(usersTable.id, target.id));

    // Invalidate all existing sessions so the new password is used.
    await db
      .update(sessionsTable)
      .set({ isActive: false })
      .where(eq(sessionsTable.userId, target.id));

    await db.insert(auditLogsTable).values({
      action: "password_reset",
      performedBy: adminId,
      targetUserId: target.id,
    });

    void logToDiscord({
      title: "🔑 Admin: password reset",
      color: "warning",
      fields: [
        { name: "Target", value: target.username, inline: true },
        { name: "By", value: adminId, inline: true },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServerErrors(error);
  }
}
