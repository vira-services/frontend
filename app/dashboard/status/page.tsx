"use client";

import { useState } from "react";
import { FaCheck, FaFaceSmile, FaEraser, FaSignal } from "react-icons/fa6";
import { setCustomStatus, clearPresence, updateStatus } from "@/lib/api";

const presences = [
  { value: "online", label: "Online", image: "https://i.imgur.com/QU35DxI.png" },
  { value: "idle", label: "Idle", image: "https://i.imgur.com/eHW8KmV.png" },
  { value: "dnd", label: "Do not disturb", image: "https://i.imgur.com/JlXjK4S.png" },
  { value: "offline", label: "Offline", image: "https://i.imgur.com/w3EYDuS.png" },
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
      await updateStatus(status);
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
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Status</h1>
        <p>Presence and a static custom status shown at all times.</p>
      </div>

      {message && (
        <div className={`message ${message.type === "error" ? "message-error" : "message-success"}`} style={{ marginBottom: 20 }}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaSignal style={{ fontSize: 11, opacity: 0.6 }} />
          Presence
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
            {presences.map((p) => {
              const active = currentPresence === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => handleSetPresence(p.value)}
                  className={active ? "option-btn option-btn-active" : "option-btn"}
                  style={{ padding: "12px 14px", justifyContent: "flex-start" }}
                >
                  <img
                    src={p.image}
                    alt={p.label}
                    width="20"
                    height="20"
                    style={{ flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                  </div>
                  {active && <FaCheck style={{ fontSize: 11, color: "var(--accent)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaFaceSmile style={{ fontSize: 12, opacity: 0.6 }} />
          Custom status
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter status text"
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                placeholder="Emoji"
                style={{ width: 140, flexShrink: 0 }}
              />
              <select
                value={clearAfter}
                onChange={(e) => setClearAfter(e.target.value)}
                style={{ flex: 1 }}
              >
                {clearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button
                onClick={handleSetCustomStatus}
                disabled={loading || !customText.trim()}
                className="btn btn-primary"
              >
                Set status
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="btn btn-ghost"
                style={{ color: "var(--danger)" }}
              >
                <FaEraser style={{ fontSize: 12 }} />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
