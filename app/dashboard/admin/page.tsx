import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  giftsTable,
  usernameBansTable,
  usersTable,
} from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { giftRewardLabel } from "@/lib/gifts";
import AdminClientPage from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/auth");

  const [me] = await db
    .select({
      admin: usersTable.admin,
      superadmin: usersTable.superadmin,
      owner: usersTable.owner,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));
  if (!me || (!me.admin && !me.superadmin && !me.owner)) {
    redirect("/dashboard");
  }

  const users = await db
    .select({
      id: usersTable.id,
      uid: usersTable.uid,
      username: usersTable.username,
      url: usersTable.url,
      email: usersTable.email,
      premium: usersTable.premium,
      blacklisted: usersTable.blacklisted,
      blacklisted_reason: usersTable.blacklisted_reason,
      admin: usersTable.admin,
      superadmin: usersTable.superadmin,
      owner: usersTable.owner,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  const gifts = await db
    .select({
      id: giftsTable.id,
      code: giftsTable.code,
      rewardType: giftsTable.rewardType,
      rewardValue: giftsTable.rewardValue,
      message: giftsTable.message,
      status: giftsTable.status,
      createdAt: giftsTable.createdAt,
      claimedAt: giftsTable.claimedAt,
      claimedUsername: usersTable.username,
    })
    .from(giftsTable)
    .leftJoin(usersTable, eq(giftsTable.claimedBy, usersTable.id))
    .orderBy(desc(giftsTable.createdAt));

  const bans = await db
    .select({
      id: usernameBansTable.id,
      username: usernameBansTable.username,
      reason: usernameBansTable.reason,
      createdAt: usernameBansTable.createdAt,
    })
    .from(usernameBansTable)
    .orderBy(desc(usernameBansTable.createdAt));

  return (
    <AdminClientPage
      initialUsers={users.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      }))}
      initialGifts={gifts.map((g) => ({
        id: g.id,
        code: g.code,
        rewardType: g.rewardType,
        rewardLabel: giftRewardLabel(g.rewardType, g.rewardValue),
        message: g.message,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
        claimedAt: g.claimedAt?.toISOString() ?? null,
        claimedUsername: g.claimedUsername ?? null,
      }))}
      initialBans={bans.map((b) => ({
        id: b.id,
        username: b.username,
        reason: b.reason,
        createdAt: b.createdAt.toISOString(),
      }))}
    />
  );
}
