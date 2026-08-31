import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS "claims" (
    "id" text PRIMARY KEY NOT NULL,
    "discordId" text NOT NULL,
    "letter" varchar(1) NOT NULL,
    "alias" varchar(64) NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "claims_discordId_unique" UNIQUE("discordId"),
    CONSTRAINT "claims_letter_unique" UNIQUE("letter"),
    CONSTRAINT "claims_alias_unique" UNIQUE("alias")
  );`);
  console.log("claims table ready");
} catch (err) {
  console.error("Failed to create claims table:", err);
  process.exit(1);
} finally {
  await pool.end();
}
