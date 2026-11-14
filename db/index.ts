import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

type Database = NodePgDatabase<Record<string, never>>;

let instance: Database | undefined;

function getDb(): Database {
  if (!instance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    instance = drizzle(databaseUrl);
  }

  return instance;
}

/**
 * Lazily initialised so that merely importing this module (e.g. while Next.js
 * collects page data during `next build`) does not require DATABASE_URL.
 * The connection is created on first query, at runtime.
 */
const db = new Proxy({} as Database, {
  get(_target, property) {
    const target = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = target[property];
    return typeof value === "function" ? value.bind(target) : value;
  },
  has(_target, property) {
    return property in (getDb() as unknown as object);
  },
});

export { db };
