import { redirect } from "next/navigation";
import GiftClientPage from "./gift-client";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { giftsTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { giftRewardLabel } from "@/lib/gifts";

export const dynamic = "force-dynamic";

export default async function GiftPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = code.toUpperCase();

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
    .where(eq(giftsTable.code, normalized))
    .limit(1);

  if (!gift) {
    redirect("/gift");
  }

  const session = await getSession();

  return (
    <GiftClientPage
      code={gift.code}
      rewardLabel={giftRewardLabel(gift.rewardType, gift.rewardValue)}
      message={gift.message}
      status={gift.status}
      isLoggedIn={!!session}
    />
  );
}
