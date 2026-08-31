import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const claimsTable = pgTable("claims", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** discord snowflake id of the user who claimed the letter */
  discordId: text().notNull().unique(),
  /** the claimed one-letter alias (single character, uppercased + trimmed) */
  letter: varchar({ length: 1 }).notNull().unique(),
  /** the letter lowercased, used as the profile url alias (e.g. vira.wtf/a) */
  alias: varchar({ length: 64 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});
