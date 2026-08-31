import "dotenv/config";
import pg from "pg";
const { Pool } = pg;
function getPool() {
    if (!pool) {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error("DATABASE_URL is not set, cannot access claims database");
        }
        pool = new Pool({ connectionString: url });
    }
    return pool;
}
let pool = null;
/** Returns the reserved letter (lowercased) for a discord user, or null. */
export async function getClaimByDiscordId(discordId) {
    const { rows } = await getPool().query(`SELECT "letter", "alias" FROM "claims" WHERE "discordId" = $1`, [discordId]);
    return rows[0] ? { letter: rows[0].letter, alias: rows[0].alias } : null;
}
/** All currently claimed letters (lowercased). */
export async function getClaimedLetters() {
    const { rows } = await getPool().query(`SELECT "letter" FROM "claims"`, []);
    return rows.map((r) => r.letter);
}
/**
 * Reserve a letter for a discord user. Returns one of:
 * - "claimed": success
 * - "already_claimed": the user already holds a letter
 * - "taken": the letter was taken by someone else
 */
export async function insertClaim(discordId, letter) {
    const normalized = letter.toLowerCase();
    const existing = await getClaimByDiscordId(discordId);
    if (existing)
        return "already_claimed";
    try {
        const res = await getPool().query(`INSERT INTO "claims" ("discordId", "letter", "alias") VALUES ($1, $2, $2)`, [discordId, normalized]);
        if (res.rowCount === 1)
            return "claimed";
    }
    catch (err) {
        // unique violation: either this user already has a row, or the letter is taken
        if (err instanceof pg.DatabaseError && err.code === "23505") {
            const conflict = await getClaimByDiscordId(discordId);
            if (conflict && conflict.letter === normalized)
                return "already_claimed";
            return "taken";
        }
        throw err;
    }
    return "taken";
}
