"use client";

import { useEffect, useState, useCallback } from "react";
import { FaRotate, FaTrash, FaPlus, FaGripLines } from "react-icons/fa6";
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
    <div className="animate-stagger">
      <div className="page-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1>Rotator</h1>
          <p>Cycle custom status text and emoji at a set interval.</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {message && (
        <div className={`message ${message.type === "error" ? "message-error" : "message-success"}`} style={{ marginBottom: 20 }}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaRotate style={{ fontSize: 11, opacity: 0.6 }} />
          Configuration
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: config.enabled ? 16 : 0 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Enable rotator</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>Automatically rotate your custom status</p>
            </div>
            <button
              onClick={() => setConfig((r) => ({ ...r, enabled: !r.enabled }))}
              className={`toggle ${config.enabled ? "toggle-on" : "toggle-off"}`}
            >
              <span className="toggle-knob" />
            </button>
          </div>
          {config.enabled && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Delay (seconds)</label>
              <input
                type="number"
                value={config.delay_sec}
                onChange={(e) =>
                  setConfig((r) => ({
                    ...r,
                    delay_sec: Math.max(1, parseInt(e.target.value) || 15),
                  }))
                }
                min={1}
                style={{ width: 120 }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaPlus style={{ fontSize: 10, opacity: 0.6 }} />
          New slot
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Status text</label>
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Status text"
                onKeyDown={(e) => e.key === "Enter" && addSlot()}
                style={{ width: "100%" }}
              />
            </div>
            <div className="form-group" style={{ width: 120, marginBottom: 0 }}>
              <label className="form-label">Emoji</label>
              <input
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="Emoji"
                onKeyDown={(e) => e.key === "Enter" && addSlot()}
                style={{ width: "100%" }}
              />
            </div>
            <button
              onClick={addSlot}
              disabled={!newText.trim()}
              className="btn btn-primary"
              style={{ height: 38 }}
            >
              <FaPlus style={{ fontSize: 11 }} />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaGripLines style={{ fontSize: 11, opacity: 0.6 }} />
          Rotation ({config.slots.length})
        </div>
        <div className="card" style={{ padding: 20 }}>
          {config.slots.length === 0 ? (
            <div className="empty-state" style={{ padding: "20px 0" }}>
              <FaRotate style={{ fontSize: 20 }} />
              <p>No slots yet. Add one above.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {config.slots.map((slot, i) => (
                <div key={i} className="slot-item">
                  <FaGripLines style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {slot.text || "\u2014"}
                    </p>
                    {slot.emoji && (
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>{slot.emoji}</p>
                    )}
                  </div>
                  <button onClick={() => removeSlot(i)} className="btn btn-ghost btn-xs" style={{ color: "var(--danger)" }}>
                    <FaTrash style={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
