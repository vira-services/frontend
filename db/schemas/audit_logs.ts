import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
export const actionEnum = pgEnum("action", [
  "uid_swap",
  "url_change",
  "blacklist",
  "unblacklist",
  "premium_grant",
  "premium_revoke",
  "alias_tokens_gift",
  "password_reset",
  "username_ban",
  "username_unban",
  "gift_create",
  "gift_revoke",
]);
export const auditLogsTable = pgTable("audit_logs", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  action: actionEnum().notNull(),
  performedBy: text().notNull(),
  targetUserId: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
