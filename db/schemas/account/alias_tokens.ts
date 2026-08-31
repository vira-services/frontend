import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

/**
 * Alias tokens: a pool of one-time codes that let a user add a free-form
 * alternate url (alias) to their profile. A token is consumed when redeemed.
 * Owner is set at redemption time (tokens may be generated ahead of issuance,
 * so the owner is filled in on redeem).
 */
export const aliasTokensTable = pgTable("alias_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** the secret code users type in to redeem (e.g. "ABC123-DEF456") */
  code: text("code").notNull().unique(),
  /** the user who redeemed this token (null until redeemed) */
  redeemedBy: text("redeemed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  /** the alias value this token granted (null until redeemed) */
  grantedAlias: text("granted_alias"),
  redeemedAt: timestamp("redeemed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
