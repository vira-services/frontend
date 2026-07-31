const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("vira_jwt") : null;
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

export function getAuthUrl() {
  return request("/auth/discord");
}

export function handleCallback(code: string) {
  return request("/auth/callback", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function completeOnboarding(discordId: string, token: string) {
  return request("/auth/onboarding/complete", {
    method: "POST",
    body: JSON.stringify({ discord_id: discordId, token }),
  });
}

export function getOnboardingStatus() {
  return request("/auth/onboarding/status");
}

export function restartInstance() {
  return request("/instances/self/restart", { method: "POST" });
}

export function getStats() {
  return request("/stats");
}

export function getStatus() {
  return request("/status");
}

export function updateStatus(status: string) {
  return request("/status/update", {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export function getDevicePresets() {
  return request("/device/presets");
}

export function setDevicePreset(preset: string) {
  return request("/device/preset", {
    method: "POST",
    body: JSON.stringify({ preset }),
  });
}

export function getRotatorConfig() {
  return request("/rotator");
}

export function saveRotatorConfig(config: any) {
  return request("/rotator", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

export function setRichPresence(data: any) {
  return request("/rpc/set-rich-presence", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function clearPresence() {
  return request("/clear", { method: "POST" });
}

export function setCustomStatus(data: any) {
  return request("/rpc/set-custom-status", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getPlatforms() {
  return request("/platforms");
}

export function logoutUser() {
  return request("/logout", { method: "POST" });
}

export function reconnect() {
  return request("/reconnect", { method: "POST" });
}

export function getModuleSettings() {
  return request("/modules/settings");
}

export function getPresenceSettings() {
  return request("/presence/settings");
}

export function setRpcEnabled(enabled: boolean) {
  return request("/rpc/toggle", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

// ---- Quests ----

export function getQuestsStatus() {
  return request("/quests/status");
}

export function startQuests() {
  return request("/quests/start", { method: "POST" });
}

export function stopQuests() {
  return request("/quests/stop", { method: "POST" });
}

export function skipQuests() {
  return request("/quests/skip", { method: "POST" });
}

// ---- Bot management ----

export function getBots() {
  return request("/bots");
}

export function addBot(botToken: string, clientId?: string) {
  const body: any = { bot_token: botToken };
  if (clientId) body.client_id = clientId;
  return request("/bots", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function removeBot(botId: number) {
  return request(`/bots/${botId}`, { method: "DELETE" });
}

export function reconnectBot(botId: number) {
  return request(`/bots/${botId}/reconnect`, { method: "POST" });
}

export function updateBot(botId: number, data: { accent_color?: string | null; thumbnail_url?: string | null }) {
  return request(`/bots/${botId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function setBotAvatar(botId: number, file: File) {
  const token = typeof window !== "undefined" ? localStorage.getItem("vira_jwt") : null;
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return request(`/bots/${botId}/avatar`, {
    method: "POST",
    body: form,
    headers,
  });
}
