import { db } from "@/db";
import {
  aliasTokensTable,
  badgesTable,
  giftsTable,
  usersTable,
} from "@/db/schemas";
import { ViraError } from "@/lib/error";
import { BADGE_CONFIG, getColor } from "@/lib/badges";
import { eq, desc } from "drizzle-orm";

const ALIAS_TOKEN_PREFIX = "VIRA-";

export function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export function generateAliasTokenCode(): string {
  const part = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };
  return `${ALIAS_TOKEN_PREFIX}${part()}-${part()}`;
}

export type GiftReward = {
  type: "badge" | "premium" | "alias_token";
  label: string;
  value?: string;
};

export function giftRewardLabel(type: string, value?: string | null): string {
  switch (type) {
    case "badge":
      return BADGE_CONFIG[value ?? ""]?.name ?? "Badge";
    case "premium":
      return "Premium";
    case "alias_token":
      return "Alias Token";
    default:
      return type;
  }
}

/**
 * Applies a gift reward to a user (badge / premium / alias token).
 * Marks the gift as claimed. Returns a human summary.
 */
export async function applyGift(
  giftId: string,
  userId: string,
): Promise<string> {
  const [gift] = await db
    .select()
    .from(giftsTable)
    .where(eq(giftsTable.id, giftId));
  if (!gift) throw new ViraError("Gift not found", 404);
  if (gift.status !== "active") throw new ViraError("Gift is no longer active", 410);
  if (gift.claimedBy) throw new ViraError("Gift has already been claimed", 409);

  let summary: string;

  switch (gift.rewardType) {
    case "badge": {
      const badgeId = gift.rewardValue ?? "";
      const config = BADGE_CONFIG[badgeId.toLowerCase()];
      if (!config) throw new ViraError("Gift badge is invalid", 400);

      const [current] = await db
        .select({ position: badgesTable.position })
        .from(badgesTable)
        .where(eq(badgesTable.userId, userId))
        .orderBy(desc(badgesTable.position))
        .limit(1);
      const position = (current?.position ?? -1) + 1;

      await db.insert(badgesTable).values({
        userId,
        name: config.name,
        icon: badgeId.toLowerCase(),
        icon_color: getColor(badgeId),
        position,
      });
      summary = `Badge: ${config.name}`;
      break;
    }
    case "premium": {
      await db
        .update(usersTable)
        .set({ premium: true, premium_since: new Date() })
        .where(eq(usersTable.id, userId));
      summary = "Premium";
      break;
    }
    case "alias_token": {
      const tokenCode = generateAliasTokenCode();
      await db.insert(aliasTokensTable).values({
        code: tokenCode,
      });
      summary = `Alias Token: ${tokenCode}`;
      break;
    }
    default:
      throw new ViraError("Unknown gift reward", 400);
  }

  // Atomic-ish claim (single use).
  await db
    .update(giftsTable)
    .set({ status: "claimed", claimedBy: userId, claimedAt: new Date() })
    .where(eq(giftsTable.id, giftId));

  return summary;
}
