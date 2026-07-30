"use client";

import { useEffect, useState } from "react";
import { getModuleSettings, updateModuleSettings } from "@/lib/api";

export default function WebhookPage() {
  const [cfg, setCfg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getModuleSettings()
      .then(setCfg)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!cfg) return;
    setSaving(true);
    setMessage("");
    try {
      await updateModuleSettings({
        webhook_enabled: cfg.webhook_enabled,
        webhook_url: cfg.webhook_url,
        webhook_color: cfg.webhook_color,
        webhook_name: cfg.webhook_name,
        webhook_img: cfg.webhook_img,
        webhook_delay: cfg.webhook_delay,
      });
      setMessage("Webhook settings saved");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: "var(--text-tertiary)", fontSize: 14, padding: "40px 0" }}>Loading...</div>;

  return (
    <div className="animate-stagger-in space-y-6 pb-10">
      <header className="animate-fade-up">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Modules</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">Webhook</h1>
        <p className="mt-2 text-[0.95rem] text-[#8a8a92]">Route command responses through a Discord webhook for nicer embeds</p>
      </header>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 12,
          background: message.includes("Error") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          color: message.includes("Error") ? "var(--danger)" : "var(--success)",
          fontSize: 14, border: `1px solid ${message.includes("Error") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
        }}>
          {message}
        </div>
      )}

      <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold tracking-tight text-white/90">Settings</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: "rgba(255,255,255,0.08)", color: "var(--text-primary)",
              padding: "8px 20px", fontSize: 13, fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Enabled</label>
          <input
            type="checkbox"
            checked={cfg?.webhook_enabled || false}
            onChange={(e) => setCfg({ ...cfg, webhook_enabled: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Webhook URL</label>
          <input
            type="text"
            value={cfg?.webhook_url || ""}
            onChange={(e) => setCfg({ ...cfg, webhook_url: e.target.value })}
            placeholder="https://discord.com/api/webhooks/..."
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Display Name</label>
          <input
            type="text"
            value={cfg?.webhook_name || ""}
            onChange={(e) => setCfg({ ...cfg, webhook_name: e.target.value })}
            placeholder="vira"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Embed Color</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="color"
              value={`#${(cfg?.webhook_color ?? 0x9B59B6).toString(16).padStart(6, "0")}`}
              onChange={(e) => setCfg({ ...cfg, webhook_color: parseInt(e.target.value.slice(1), 16) })}
              style={{ width: 48, height: 40, padding: 0, border: "none", cursor: "pointer", borderRadius: 8 }}
            />
            <input
              type="text"
              value={`#${(cfg?.webhook_color ?? 0x9B59B6).toString(16).padStart(6, "0")}`}
              onChange={(e) => {
                const h = e.target.value.replace("#", "");
                const n = parseInt(h, 16);
                if (!isNaN(n)) setCfg({ ...cfg, webhook_color: n });
              }}
              style={{ width: 120 }}
              placeholder="#9B59B6"
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Image URL (optional)</label>
          <input
            type="text"
            value={cfg?.webhook_img || ""}
            onChange={(e) => setCfg({ ...cfg, webhook_img: e.target.value })}
            placeholder="https://i.imgur.com/..."
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Auto-delete delay (seconds, 0 = off)</label>
          <input
            type="number"
            value={cfg?.webhook_delay ?? 10}
            onChange={(e) => setCfg({ ...cfg, webhook_delay: parseInt(e.target.value) || 0 })}
            min={0}
            max={86400}
            style={{ width: 120 }}
          />
        </div>
      </section>

      {cfg?.webhook_url && (
        <section className="dash-v2-panel p-4 sm:p-5 md:p-6" style={{ borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.04)" }}>
          <h2 className="text-sm font-semibold tracking-tight text-white/90 mb-4">Preview</h2>
          <div style={{
            background: "var(--bg-secondary)", borderRadius: 10, padding: 16,
            borderLeft: `4px solid #${(cfg?.webhook_color ?? 0x9B59B6).toString(16).padStart(6, "0")}`,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
              {cfg?.webhook_name || "vira"}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>
              Command response will appear here
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 10, opacity: 0.6 }}>
              vira.wtf • command output
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
