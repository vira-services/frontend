import { handleServerErrors, ViraError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/zod";
import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { logToDiscord } from "@/lib/api/utils/discordLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, newPassword, confirmPassword } = parsed.data;

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords don't match" },
        { status: 400 },
      );
    }
    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        resetPasswordToken: usersTable.resetPasswordToken,
        resetPasswordTokenExpiresAt: usersTable.resetPasswordTokenExpiresAt,
      })
      .from(usersTable)
      .where(eq(usersTable.resetPasswordToken, token));
    if (!user) {
      throw new ViraError("Invalid or expired token", 404);
    }
    if (
      user.resetPasswordTokenExpiresAt &&
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      throw new ViraError("Token expired", 410);
    }
    const hashedPassword = await argon2.hash(newPassword);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      })
      .where(eq(usersTable.id, user.id));

    void logToDiscord({
      title: "🔒 Password changed",
      color: "warning",
      fields: [{ name: "Email", value: user.email, inline: true }],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ViraError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return handleServerErrors(error);
  }
}
