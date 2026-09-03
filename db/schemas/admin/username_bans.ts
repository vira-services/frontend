import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const usernameBansTable = pgTable("username_bans", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** blocked username (and matching url) that can no longer be registered */
  username: varchar({ length: 255 }).notNull().unique(),
  /** reason for the ban */
  reason: text(),
  bannedBy: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp().notNull().defaultNow(),
});
