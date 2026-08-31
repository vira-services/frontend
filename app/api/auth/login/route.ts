import { authenticateUser, parseUserAgent } from "@/lib/auth/utils";
import { handleServerErrors } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation/zod";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { email, password } = parsed.data;
    const ip = req.headers.get("x-forwarded-for") || "Unknown IP";
    const userAgentStr = req.headers.get("user-agent") || "";
    const { os, browser } = parseUserAgent(userAgentStr);

    await authenticateUser({
      email,
      password,
      os,
      browser,
      ip,
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
