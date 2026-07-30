"use client";

import { useEffect, useState } from "react";
import { FaPaperPlane, FaFloppyDisk, FaCircle } from "react-icons/fa6";
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

  if (loading) return <div style={{ paddingTop: 20, color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>;

  const colorHex = (cfg?.webhook_color ?? 0x9B59B6).toString(16).padStart(6, "0");

  return (
    <div className="animate-stagger">
      <div className="page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Webhook</h1>
          <p>Route command responses through a Discord webhook for nicer embeds.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          <FaFloppyDisk style={{ fontSize: 12 }} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes("Error") ? "message-error" : "message-success"}`} style={{ marginBottom: 20 }}>
          <span>{message}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaPaperPlane style={{ fontSize: 11, opacity: 0.6 }} />
          Settings
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Enable webhook</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>Route command responses through a webhook</p>
            </div>
            <button
              onClick={() => setCfg({ ...cfg, webhook_enabled: !cfg.webhook_enabled })}
              className={`toggle ${cfg?.webhook_enabled ? "toggle-on" : "toggle-off"}`}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Webhook url</label>
            <input
              type="text"
              value={cfg?.webhook_url || ""}
              onChange={(e) => setCfg({ ...cfg, webhook_url: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
              style={{ width: "100%" }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Display name</label>
              <input
                type="text"
                value={cfg?.webhook_name || ""}
                onChange={(e) => setCfg({ ...cfg, webhook_name: e.target.value })}
                placeholder="vira"
                style={{ width: "100%" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Embed color</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="color"
                  value={`#${colorHex}`}
                  onChange={(e) => setCfg({ ...cfg, webhook_color: parseInt(e.target.value.slice(1), 16) })}
                  style={{ width: 40, height: 36, padding: 2, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)" }}
                />
                <input
                  type="text"
                  value={`#${colorHex}`}
                  onChange={(e) => {
                    const h = e.target.value.replace("#", "");
                    const n = parseInt(h, 16);
                    if (!isNaN(n)) setCfg({ ...cfg, webhook_color: n });
                  }}
                  style={{ width: 110 }}
                  placeholder="#9B59B6"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Image url (optional)</label>
              <input
                type="text"
                value={cfg?.webhook_img || ""}
                onChange={(e) => setCfg({ ...cfg, webhook_img: e.target.value })}
                placeholder="https://i.imgur.com/..."
                style={{ width: "100%" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Auto-delete delay (seconds, 0 = off)</label>
              <input
                type="number"
                value={cfg?.webhook_delay ?? 10}
                onChange={(e) => setCfg({ ...cfg, webhook_delay: parseInt(e.target.value) || 0 })}
                min={0}
                max={86400}
                style={{ width: 120 }}
              />
            </div>
          </div>
        </div>
      </div>

      {cfg?.webhook_url && (
        <div className="page-section">
          <div className="section-title">
            <FaCircle style={{ fontSize: 9, opacity: 0.6 }} />
            Preview
          </div>
          <div className="card card-accent" style={{ padding: 20 }}>
            <div style={{
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-md)",
              padding: 16,
              borderLeft: `4px solid #${colorHex}`,
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                {cfg?.webhook_name || "vira"}
              </p>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Command response will appear here
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10 }}>
                vira.wtf &bull; command output
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
