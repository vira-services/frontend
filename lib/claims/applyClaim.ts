import { db } from "@/db";
import { aliasesTable, claimsTable, usersTable } from "@/db/schemas";
import { eq, and } from "drizzle-orm";

/**
 * Apply a user's claimed 1L (one-letter alias) to their account.
 * Looks up the reservation by discord id, then registers the claimed letter
 * as an *alternate* alias (so `/a` also resolves to their profile) WITHOUT
 * overwriting their main custom url (e.g. `/aaryn`). The main url stays
 * untouched; the alias points at the same profile.
 * Returns the claim if one exists and was applied, the claim if it is already
 * applied, or null if there is no claim.
 */
export async function applyClaimedAliasByDiscordId(
  userId: string,
  discordId: string,
): Promise<{ letter: string; alias: string } | null> {
  const [claim] = await db
    .select({ letter: claimsTable.letter, alias: claimsTable.alias })
    .from(claimsTable)
    .where(eq(claimsTable.discordId, discordId))
    .limit(1);
  if (!claim) return null;

  const letter = claim.letter.toLowerCase();

  // Already registered for this user -> nothing to do.
  const [owned] = await db
    .select({ id: aliasesTable.id })
    .from(aliasesTable)
    .where(
      and(
        eq(aliasesTable.alias, letter),
        eq(aliasesTable.userId, userId),
      ),
    )
    .limit(1);
  if (owned) return claim;

  // Taken by another user's alias or by another account's main url -> skip.
  const [collision] = await db
    .select({ id: aliasesTable.id })
    .from(aliasesTable)
    .where(eq(aliasesTable.alias, letter))
    .limit(1);
  if (collision) return claim;

  const [urlCollision] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.url, letter))
    .limit(1);
  if (urlCollision) return claim;

  // Register the alias as an alternate url. The user's main url is unchanged.
  await db
    .insert(aliasesTable)
    .values({ userId, alias: letter })
    .onConflictDoNothing();

  return claim;
}
