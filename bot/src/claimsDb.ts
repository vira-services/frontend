import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

interface ClaimRow {
  id: string;
  discordId: string;
  letter: string;
  alias: string;
  createdAt: Date;
}

function getPool(): pg.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set, cannot access claims database");
    }
    pool = new Pool({ connectionString: url });
  }
  return pool;
}

let pool: pg.Pool | null = null;

/** Returns the reserved letter (lowercased) for a discord user, or null. */
export async function getClaimByDiscordId(
  discordId: string,
): Promise<{ letter: string; alias: string } | null> {
  const { rows } = await getPool().query<ClaimRow>(
    `SELECT "letter", "alias" FROM "claims" WHERE "discordId" = $1`,
    [discordId],
  );
  return rows[0] ? { letter: rows[0].letter, alias: rows[0].alias } : null;
}

/** All currently claimed letters (lowercased). */
export async function getClaimedLetters(): Promise<string[]> {
  const { rows } = await getPool().query<ClaimRow>(
    `SELECT "letter" FROM "claims"`,
    [],
  );
  return rows.map((r) => r.letter);
}

/** All claims with their owner discord ids (lowercased letters). */
export async function getAllClaims(): Promise<
  { letter: string; discordId: string }[]
> {
  const { rows } = await getPool().query<Pick<ClaimRow, "letter" | "discordId">>(
    `SELECT "letter", "discordId" FROM "claims"`,
    [],
  );
  return rows.map((r) => ({
    letter: r.letter.toLowerCase(),
    discordId: r.discordId,
  }));
}

/**
 * Reserve a letter for a discord user. Returns one of:
 * - "claimed": success
 * - "already_claimed": the user already holds a letter
 * - "taken": the letter was taken by someone else
 */
export async function insertClaim(
  discordId: string,
  letter: string,
): Promise<"claimed" | "already_claimed" | "taken"> {
  const normalized = letter.toLowerCase();
  const existing = await getClaimByDiscordId(discordId);
  if (existing) return "already_claimed";

  try {
    const res = await getPool().query(
      `INSERT INTO "claims" ("id", "discordId", "letter", "alias") VALUES ($1, $2, $3, $3)`,
      [crypto.randomUUID(), discordId, normalized],
    );
    if (res.rowCount === 1) return "claimed";
  } catch (err) {
    // unique violation: either this user already has a row, or the letter is taken
    if (err instanceof pg.DatabaseError && (err as { code?: string }).code === "23505") {
      const conflict = await getClaimByDiscordId(discordId);
      if (conflict && conflict.letter === normalized) return "already_claimed";
      return "taken";
    }
    throw err;
  }
  return "taken";
}
