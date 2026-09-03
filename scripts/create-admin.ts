import "dotenv/config";
import { db } from "../db";
import { configsTable, usersTable } from "../db/schemas";
import { eq, or, desc } from "drizzle-orm";
import argon2 from "argon2";

const USERNAME = "admin";
const EMAIL = "admin@vira.wtf";
const URL = "admin";
const PASSWORD = "viraadmin";

async function main() {
  const existing = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.email, EMAIL),
        eq(usersTable.username, USERNAME),
        eq(usersTable.url, URL),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const user = existing[0];
    if (user.email !== EMAIL) {
      await db
        .update(usersTable)
        .set({ email: EMAIL })
        .where(eq(usersTable.id, user.id));
      console.log(`Updated admin email to ${EMAIL}`);
    }
    console.log("Admin user:");
    console.log("  username:", user.username);
    console.log("  email:", EMAIL);
    console.log("  password:", PASSWORD);
    console.log("  url:", user.url);
    console.log("  admin:", user.admin);
    console.log("  superadmin:", user.superadmin);
    console.log("  owner:", user.owner);
    return;
  }

  const [lastUser] = await db
    .select({ uid: usersTable.uid })
    .from(usersTable)
    .orderBy(desc(usersTable.uid))
    .limit(1);
  const uid = (lastUser?.uid ?? -1) + 1;

  const hashedPassword = await argon2.hash(PASSWORD);

  const [user] = await db
    .insert(usersTable)
    .values({
      uid,
      username: USERNAME,
      url: URL,
      email: EMAIL,
      password: hashedPassword,
      admin: true,
      superadmin: true,
      owner: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .returning({ id: usersTable.id, username: usersTable.username });

  await db.insert(configsTable).values({ userId: user.id });

  console.log("Created admin user:");
  console.log("  username:", USERNAME);
  console.log("  email:", EMAIL);
  console.log("  password:", PASSWORD);
  console.log("  uid:", uid);
  console.log("  roles: admin, superadmin, owner");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
