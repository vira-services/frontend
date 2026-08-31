"use server";

import { db } from "@/db";
import { configsTable, usersTable } from "@/db/schemas";
import { handleServerErrors } from "@/lib/error";
import { and, eq, isNull } from "drizzle-orm";

export async function getUsers() {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        url: usersTable.url,
        config: {
          avatar_url: configsTable.avatar_url,
        },
      })
      .from(usersTable)
      .innerJoin(configsTable, eq(configsTable.userId, usersTable.id))
      .where(
        and(eq(usersTable.blacklisted, false), isNull(usersTable.deletedAt)),
      );

    return { count: users.length, users };
  } catch (error) {
    handleServerErrors(error);
    return { count: 0, users: [] };
  }
}
