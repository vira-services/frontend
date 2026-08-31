import { handleServerErrors, ViraError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import z from "zod";
import { sendResetEmail } from "@/lib/api/utils/resend";
import { logToDiscord } from "@/lib/api/utils/discordLog";

// inline cuz this wont be reused
export const sendResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const [user] = await db
      .select({
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user) {
      throw new ViraError("User does not exist", 404);
    }
    // generate token
    const token = Buffer.from(
      crypto.getRandomValues(new Uint8Array(32)),
    ).toString("hex");

    await db
      .update(usersTable)
      .set({
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
      .where(eq(usersTable.email, email));

    void logToDiscord({
      title: "✉️ Password reset requested",
      color: "warning",
      fields: [{ name: "Email", value: email, inline: true }],
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
