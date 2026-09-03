import { db } from "@/db";
import { giftsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, ViraError } from "@/lib/error";
import { applyGift, giftRewardLabel } from "@/lib/gifts";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const [gift] = await db
      .select({
        code: giftsTable.code,
        rewardType: giftsTable.rewardType,
        rewardValue: giftsTable.rewardValue,
        message: giftsTable.message,
        status: giftsTable.status,
        claimedAt: giftsTable.claimedAt,
      })
      .from(giftsTable)
      .where(eq(giftsTable.code, code.toUpperCase()))
      .limit(1);

    if (!gift) throw new ViraError("Gift not found", 404);

    return NextResponse.json({
      gift: {
        code: gift.code,
        rewardLabel: giftRewardLabel(gift.rewardType, gift.rewardValue),
        rewardType: gift.rewardType,
        message: gift.message,
        status: gift.status,
        claimedAt: gift.claimedAt,
      },
    });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new ViraError("You must be logged in to claim a gift", 401);

    const { code } = await params;
    const [gift] = await db
      .select({ id: giftsTable.id })
      .from(giftsTable)
      .where(eq(giftsTable.code, code.toUpperCase()))
      .limit(1);
    if (!gift) throw new ViraError("Gift not found", 404);

    const reward = await applyGift(gift.id, session.userId);

    return NextResponse.json({ success: true, reward });
  } catch (error) {
    return handleServerErrors(error);
  }
}
