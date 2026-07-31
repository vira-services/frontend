"use client";

import { useEffect, useState } from "react";
import { FaCompactDisc, FaEraser } from "react-icons/fa6";
import { setRichPresence, clearPresence, getPlatforms, getPresenceSettings, getModuleSettings, setRpcEnabled } from "@/lib/api";

const activityTypes = [
  { value: 0, label: "Playing" },
  { value: 1, label: "Streaming" },
  { value: 2, label: "Listening" },
  { value: 3, label: "Watching" },
  { value: 5, label: "Competing" },
];

const defaultForm = {
  name: "", details: "", state: "", activity_type: 0,
  large_image_url: "", large_text: "", small_image_url: "", small_text: "",
  button1_label: "", button1_url: "", button2_label: "", button2_url: "",
  stream_url: "", platform: "", start: "", end: "",
};

function buildPayload(form: any) {
  const payload: any = {
    name: form.name || null,
    details: form.details || null,
    state: form.state || null,
    large_image_url: form.large_image_url || null,
    large_text: form.large_text || null,
    small_image_url: form.small_image_url || null,
    small_text: form.small_text || null,
    activity_type: parseInt(form.activity_type) || 0,
    stream_url: form.stream_url || null,
    platform: form.platform || null,
    button1_label: form.button1_label || null,
    button1_url: form.button1_url || null,
    button2_label: form.button2_label || null,
    button2_url: form.button2_url || null,
    start: form.start ? parseInt(form.start) : null,
    end: form.end ? parseInt(form.end) : null,
  };
  return payload;
}

export default function RpcPage() {
  const [form, setForm] = useState(defaultForm);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<any>(null);

  useEffect(() => {
    getPlatforms().then(setPlatforms).catch(() => {});
    getPresenceSettings()
      .then((d) => {
        const s = d?.settings;
        if (!s) return;
        setForm((f) => ({
          ...f,
          name: s.name || "", details: s.details || "", state: s.state || "",
          large_image_url: s.large_image_url || "", large_text: s.large_text || "",
          small_image_url: s.small_image_url || "", small_text: s.small_text || "",
          button1_label: s.button1_label || "", button1_url: s.button1_url || "",
          button2_label: s.button2_label || "", button2_url: s.button2_url || "",
          stream_url: s.stream_url || "", platform: s.platform || "",
          activity_type: typeof s.activity_type === "number" ? s.activity_type : 0,
          start: s.start ? String(s.start) : "",
          end: s.end ? String(s.end) : "",
        }));
      })
      .catch(() => {});
    getModuleSettings()
      .then((m) => {
        if (m && typeof m.rpc_enabled === "boolean") setEnabled(m.rpc_enabled);
      })
      .catch(() => setEnabled(false));
  }, []);

  const setField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSetPresence = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload = buildPayload(form);
      if (!payload.name) payload.name = " ";
      await setRichPresence(payload);
      setMessage("Rich presence set and saved");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setMessage("");
    try {
      await clearPresence();
      setForm(defaultForm);
      setMessage("Presence cleared");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (next: boolean) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await setRpcEnabled(next);
      setEnabled(next);
      if (next) {
        setMessage(
          res?.outcome === "restored"
            ? "Rich presence enabled and applied from your saved settings"
            : "Rich presence enabled — set a presence to apply it"
        );
      } else {
        setMessage("Rich presence disabled");
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!platforms) {
    return <div style={{ paddingTop: 20, color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>;
  }

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Rich presence</h1>
        <p>Set your Discord rich presence activity.</p>
      </div>

      {message && (
        <div className={`message ${message.includes("Error") ? "message-error" : "message-success"}`} style={{ marginBottom: 20 }}>
          <span>{message}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaCompactDisc style={{ fontSize: 12, opacity: 0.6 }} />
          Activity
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Enable rich presence</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>
                Restores your saved activity after a restart
              </p>
            </div>
            <button
              onClick={() => { if (enabled !== null) handleToggle(!enabled); }}
              disabled={loading || enabled === null}
              className={`toggle ${enabled ? "toggle-on" : "toggle-off"}`}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          {enabled === false && (
            <div className="message message-warning" style={{ marginBottom: 20 }}>
              <span>Rich presence is disabled. Configure your activity and enable it when ready.</span>
            </div>
          )}

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Activity type</label>
              <select value={form.activity_type} onChange={(e) => setField("activity_type", parseInt(e.target.value))} style={{ width: "100%" }}>
                {activityTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Application name</label>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Visual Studio Code" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Details</label>
              <input value={form.details} onChange={(e) => setField("details", e.target.value)} placeholder="Top line text" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input value={form.state} onChange={(e) => setField("state", e.target.value)} placeholder="Bottom line text" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Stream url</label>
              <input value={form.stream_url} onChange={(e) => setField("stream_url", e.target.value)} placeholder="https://twitch.tv/..." style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select value={form.platform} onChange={(e) => setField("platform", e.target.value)} style={{ width: "100%" }}>
                <option value="">None</option>
                {platforms?.platforms?.map((p: any) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="divider" />

          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "lowercase", letterSpacing: "0.02em" }}>Images</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Large image url</label>
              <input value={form.large_image_url} onChange={(e) => setField("large_image_url", e.target.value)} placeholder="Image URL or key" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Large image tooltip</label>
              <input value={form.large_text} onChange={(e) => setField("large_text", e.target.value)} placeholder="Hover text" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Small image url</label>
              <input value={form.small_image_url} onChange={(e) => setField("small_image_url", e.target.value)} placeholder="Image URL or key" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Small image tooltip</label>
              <input value={form.small_text} onChange={(e) => setField("small_text", e.target.value)} placeholder="Hover text" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="divider" />

          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "lowercase", letterSpacing: "0.02em" }}>Buttons</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Button 1 label</label>
              <input value={form.button1_label} onChange={(e) => setField("button1_label", e.target.value)} placeholder="Button text" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Button 1 url</label>
              <input value={form.button1_url} onChange={(e) => setField("button1_url", e.target.value)} placeholder="https://..." style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Button 2 label</label>
              <input value={form.button2_label} onChange={(e) => setField("button2_label", e.target.value)} placeholder="Button text" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Button 2 url</label>
              <input value={form.button2_url} onChange={(e) => setField("button2_url", e.target.value)} placeholder="https://..." style={{ width: "100%" }} />
            </div>
          </div>

          <div className="divider" />

          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "lowercase", letterSpacing: "0.02em" }}>Timestamps (unix ms)</p>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start time</label>
              <input value={form.start} onChange={(e) => setField("start", e.target.value)} placeholder="e.g. 1700000000000" style={{ width: "100%" }} />
            </div>
            <div className="form-group">
              <label className="form-label">End time</label>
              <input value={form.end} onChange={(e) => setField("end", e.target.value)} placeholder="e.g. 1700003600000" style={{ width: "100%" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button onClick={handleSetPresence} disabled={loading || !enabled} className="btn btn-primary">
              {loading ? "Sending..." : "Set presence"}
            </button>
            <button onClick={handleClear} disabled={loading} className="btn btn-ghost" style={{ color: "var(--danger)" }}>
              <FaEraser style={{ fontSize: 12 }} />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
