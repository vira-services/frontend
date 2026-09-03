import {
  pgTable,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./account/user";

export const giftRewardEnum = pgEnum("gift_reward", [
  "badge",
  "premium",
  "alias_token",
]);
export const giftStatusEnum = pgEnum("gift_status", [
  "active",
  "claimed",
  "revoked",
]);

export const giftsTable = pgTable("gifts", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** the secret code used in the gift.vira.wtf/<code> link */
  code: text().notNull().unique(),
  /** badge | premium | alias_token */
  rewardType: giftRewardEnum().notNull(),
  /** for badge = badge id, for premium = "premium", for alias_token = "alias_token" */
  rewardValue: text(),
  /** optional note shown to the person claiming the gift */
  message: text(),
  createdBy: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  status: giftStatusEnum().notNull().default("active"),
  claimedBy: text().references(() => usersTable.id, { onDelete: "set null" }),
  claimedAt: timestamp(),
  createdAt: timestamp().notNull().defaultNow(),
});
