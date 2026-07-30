"use client";

import { useState } from "react";
import { FiCircle, FiMoon, FiMinusCircle, FiCheck } from "react-icons/fi";
import { setCustomStatus, clearPresence } from "@/lib/api";

const presences = [
  { value: "online", label: "Online", icon: FiCircle, color: "#22c55e" },
  { value: "idle", label: "Idle", icon: FiMoon, color: "#eab308" },
  { value: "dnd", label: "Do Not Disturb", icon: FiMinusCircle, color: "#ef4444" },
  { value: "invisible", label: "Invisible", icon: FiCircle, color: "#52525b" },
];

const clearOptions = [
  { value: "0", label: "Don't clear" },
  { value: "1800", label: "30 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "7200", label: "2 hours" },
  { value: "43200", label: "12 hours" },
  { value: "86400", label: "24 hours" },
];

export default function StatusPage() {
  const [currentPresence, setCurrentPresence] = useState("online");
  const [customText, setCustomText] = useState("");
  const [customEmoji, setCustomEmoji] = useState("");
  const [clearAfter, setClearAfter] = useState("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const handleSetPresence = async (status: string) => {
    setCurrentPresence(status);
    try {
      await fetch(`/api/presence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  const handleSetCustomStatus = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const payload: any = { text: customText };
      if (customEmoji) payload.emoji = { name: customEmoji };
      if (clearAfter !== "0") payload.expires_after_seconds = parseInt(clearAfter);
      await setCustomStatus(payload);
      setMessage({ type: "success", text: "Custom status set!" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to set status" });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    try {
      await clearPresence();
      setCustomText("");
      setCustomEmoji("");
      setMessage({ type: "success", text: "Status cleared" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to clear status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-page space-y-5 sm:space-y-6 pb-10">
      <header className="dash-page-header mb-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="group flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-zinc-600">
            <FiCircle className="text-xs" />
            Discord
          </p>
          <h1 className="mt-1 text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-tight text-white">Status</h1>
          <p className="mt-2 text-sm text-zinc-500">Presence and a static custom status shown at all times.</p>
        </div>
      </header>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm border ${
            message.type === "error"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="dash-card group/card p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight text-white/90">Presence</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {presences.map((p) => {
            const Icon = p.icon;
            const active = currentPresence === p.value;
            return (
              <button
                key={p.value}
                onClick={() => handleSetPresence(p.value)}
                className="group/btn relative flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.04)" : "transparent",
                  borderColor: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                  color: active ? "#ededf4" : "#a1a1aa",
                }}
              >
                <Icon className="shrink-0 text-lg" style={{ color: p.color }} />
                <span className="truncate">{p.label}</span>
                {active && <FiCheck className="ml-auto shrink-0 text-xs text-zinc-500" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="dash-card group/card p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight text-white/90">Custom status</h2>
        <div className="mt-4 space-y-3">
          <input
            className="dash-input"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter status text"
          />
          <div className="flex items-center gap-3">
            <input
              className="dash-input w-32"
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              placeholder="Emoji"
            />
            <select
              className="dash-input flex-1"
              value={clearAfter}
              onChange={(e) => setClearAfter(e.target.value)}
            >
              {clearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSetCustomStatus}
              disabled={loading || !customText.trim()}
              className="dash-btn-base h-9 px-4 text-sm dash-btn-v-primary"
            >
              Set status
            </button>
            <button
              onClick={handleClear}
              disabled={loading}
              className="dash-btn-base h-9 px-4 text-sm dash-btn-v-ghost"
            >
              Clear
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
