import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { ViraError } from "@/lib/error";
import { eq } from "drizzle-orm";

/**
 * Resolves the current session and verifies the user has staff/admin access.
 * Returns the acting user id, or throws when unauthorized.
 */
export async function requireAdmin(): Promise<string> {
  const session = await getSession();
  if (!session) throw new ViraError("Unauthorized", 401);

  const [user] = await db
    .select({
      admin: usersTable.admin,
      superadmin: usersTable.superadmin,
      owner: usersTable.owner,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  if (!user || (!user.admin && !user.superadmin && !user.owner)) {
    throw new ViraError("Forbidden", 403);
  }

  return session.userId;
}
