import type { Presence } from "discord.js";
import type { DiscordPresenceData } from "./types.js";

export interface CachedUser {
  /** timestamp of last presence update from the gateway (set on write) */
  updatedAt?: number;
  data: DiscordPresenceData;
  /** extra data not part of the public presence payload */
  metadata: {
    /** raw discord role ids (not names) -> sorted names */
    roleNames: string[];
    guildId: string | null;
  };
}

const store = new Map<string, CachedUser>();

const TTL_MS = 60 * 60 * 1000; // 1 hour

export function setUser(userId: string, entry: CachedUser): void {
  entry.updatedAt = Date.now();
  store.set(userId, entry);
}

export function getUser(userId: string): CachedUser | null {
  const entry = store.get(userId);
  if (!entry) return null;
  if (entry.updatedAt && Date.now() - entry.updatedAt > TTL_MS) {
    store.delete(userId);
    return null;
  }
  return entry;
}

export function deleteUser(userId: string): void {
  store.delete(userId);
}

/** keep the presence reference for advanced handlers */
export function setPresenceRef(userId: string, presence: Presence): void {
  presenceRefs.set(userId, presence);
}

export function getPresenceRef(userId: string): Presence | null {
  return presenceRefs.get(userId) ?? null;
}

const presenceRefs = new Map<string, Presence>();
