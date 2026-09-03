import { db } from "@/db";
import { auditLogsTable, giftsTable, usersTable } from "@/db/schemas";
import { requireAdmin } from "@/lib/admin";
import { handleServerErrors, ViraError } from "@/lib/error";
import { generateGiftCode, giftRewardLabel } from "@/lib/gifts";
import { BADGE_CONFIG } from "@/lib/badges";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logToDiscord } from "@/lib/api/utils/discordLog";

const createSchema = z.object({
  rewardType: z.enum(["badge", "premium", "alias_token"]),
  badge: z.string().optional(),
  message: z.string().max(500).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    const gifts = await db
      .select({
        id: giftsTable.id,
        code: giftsTable.code,
        rewardType: giftsTable.rewardType,
        rewardValue: giftsTable.rewardValue,
        message: giftsTable.message,
        status: giftsTable.status,
        claimedBy: giftsTable.claimedBy,
        claimedAt: giftsTable.claimedAt,
        createdAt: giftsTable.createdAt,
        claimedUsername: usersTable.username,
      })
      .from(giftsTable)
      .leftJoin(usersTable, eq(giftsTable.claimedBy, usersTable.id))
      .orderBy(desc(giftsTable.createdAt));

    const mapped = gifts.map((g) => ({
      ...g,
      rewardLabel: giftRewardLabel(g.rewardType, g.rewardValue),
      claimedUsername: g.claimedUsername ?? null,
    }));
    return NextResponse.json({ gifts: mapped });
  } catch (error) {
    return handleServerErrors(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    let rewardValue: string | null = null;
    if (parsed.data.rewardType === "badge") {
      const badgeId = parsed.data.badge?.toLowerCase() ?? "";
      if (!BADGE_CONFIG[badgeId]) {
        throw new ViraError("That badge does not exist", 400);
      }
      rewardValue = badgeId;
    }

    const [gift] = await db
      .insert(giftsTable)
      .values({
        code: generateGiftCode(),
        rewardType: parsed.data.rewardType,
        rewardValue,
        message: parsed.data.message || null,
        createdBy: adminId,
      })
      .returning();

    await db.insert(auditLogsTable).values({
      action: "gift_create",
      performedBy: adminId,
    });

    void logToDiscord({
      title: "🎁 Admin: gift created",
      color: "success",
      fields: [
        { name: "Code", value: gift.code, inline: true },
        {
          name: "Reward",
          value: giftRewardLabel(gift.rewardType, gift.rewardValue),
          inline: true,
        },
        { name: "By", value: adminId, inline: true },
      ],
    });

    return NextResponse.json({ gift }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
