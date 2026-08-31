const store = new Map();
const TTL_MS = 60 * 60 * 1000; // 1 hour
export function setUser(userId, entry) {
    entry.updatedAt = Date.now();
    store.set(userId, entry);
}
export function getUser(userId) {
    const entry = store.get(userId);
    if (!entry)
        return null;
    if (entry.updatedAt && Date.now() - entry.updatedAt > TTL_MS) {
        store.delete(userId);
        return null;
    }
    return entry;
}
export function deleteUser(userId) {
    store.delete(userId);
}
/** keep the presence reference for advanced handlers */
export function setPresenceRef(userId, presence) {
    presenceRefs.set(userId, presence);
}
export function getPresenceRef(userId) {
    return presenceRefs.get(userId) ?? null;
}
const presenceRefs = new Map();
