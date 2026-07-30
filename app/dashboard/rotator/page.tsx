"use client";

import { useEffect, useState, useCallback } from "react";
import { FiRefreshCw, FiTrash2, FiMenu } from "react-icons/fi";
import { getRotatorConfig, saveRotatorConfig } from "@/lib/api";

interface RotatorSlot {
  text: string;
  emoji: string;
}

interface RotatorConfig {
  enabled: boolean;
  delay_sec: number;
  slots: RotatorSlot[];
}

export default function RotatorPage() {
  const [config, setConfig] = useState<RotatorConfig>({
    enabled: false,
    delay_sec: 30,
    slots: [],
  });
  const [newText, setNewText] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    getRotatorConfig()
      .then((data) => {
        if (data?.config) setConfig(data.config);
        else if (data?.slots) setConfig(data);
      })
      .catch(() => {});
  }, []);

  const addSlot = () => {
    if (!newText.trim()) return;
    setConfig((r) => ({
      ...r,
      slots: [...r.slots, { text: newText.trim(), emoji: newEmoji.trim() }],
    }));
    setNewText("");
    setNewEmoji("");
  };

  const removeSlot = (i: number) => {
    setConfig((r) => ({ ...r, slots: r.slots.filter((_, idx) => idx !== i) }));
  };

  const handleSave = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      await saveRotatorConfig(config);
      setMessage({ type: "success", text: "Rotator saved!" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  }, [config]);

  return (
    <div className="dash-page space-y-5 sm:space-y-6 pb-10">
      <header className="dash-page-header mb-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="group flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-zinc-600">
            <FiRefreshCw className="text-xs" />
            Discord
          </p>
          <h1 className="mt-1 text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-tight text-white">
            Rotator
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Cycle custom status text and emoji at a set interval.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="dash-btn-base h-9 px-4 text-sm dash-btn-v-primary"
        >
          {loading ? "Saving..." : "Save"}
        </button>
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white/90">
              Enable rotator
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Automatically rotate your custom status
            </p>
          </div>
          <button
            onClick={() => setConfig((r) => ({ ...r, enabled: !r.enabled }))}
            className="relative h-6 w-10 rounded-full transition-colors"
            style={{
              background: config.enabled
                ? "#ededf4"
                : "rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-black transition-transform"
              style={{
                transform: config.enabled
                  ? "translateX(16px)"
                  : "translateX(0)",
              }}
            />
          </button>
        </div>
        {config.enabled && (
          <div className="mt-4 flex items-center gap-3">
            <label className="text-sm text-zinc-400">Delay (seconds)</label>
            <input
              type="number"
              className="dash-input w-24"
              value={config.delay_sec}
              onChange={(e) =>
                setConfig((r) => ({
                  ...r,
                  delay_sec: Math.max(1, parseInt(e.target.value) || 15),
                }))
              }
              min={1}
            />
          </div>
        )}
      </section>

      <section className="dash-card group/card p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight text-white/90">
          New slot
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <input
            className="dash-input flex-1"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Status text"
            onKeyDown={(e) => e.key === "Enter" && addSlot()}
          />
          <input
            className="dash-input w-24"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
            placeholder="Emoji"
            onKeyDown={(e) => e.key === "Enter" && addSlot()}
          />
          <button
            onClick={addSlot}
            disabled={!newText.trim()}
            className="dash-btn-base h-9 px-4 text-sm dash-btn-v-primary shrink-0"
          >
            Add slot
          </button>
        </div>
      </section>

      <section className="dash-card group/card p-4 sm:p-5">
        <h2 className="text-sm font-semibold tracking-tight text-white/90">
          Rotation
        </h2>
        {config.slots.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No slots yet. Add one above.
          </p>
        ) : (
          <div className="mt-3 space-y-1">
            {config.slots.map((slot, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2.5"
              >
                <FiMenu className="shrink-0 text-zinc-600" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-white/90">
                    {slot.text || "\u2014"}
                  </p>
                  {slot.emoji && (
                    <p className="text-xs text-zinc-500">{slot.emoji}</p>
                  )}
                </div>
                <button
                  onClick={() => removeSlot(i)}
                  className="dash-btn-base h-8 w-8 dash-btn-v-ghost shrink-0"
                >
                  <FiTrash2 className="text-sm text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
