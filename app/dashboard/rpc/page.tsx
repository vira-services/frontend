"use client";

import { useEffect, useState } from "react";
import { FaCompactDisc, FaEraser } from "react-icons/fa6";
import { setRichPresence, clearPresence, getPlatforms } from "@/lib/api";

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

export default function RpcPage() {
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState<any>(null);

  useEffect(() => {
    getPlatforms().then(setPlatforms).catch(() => {});
  }, []);

  const setField = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  const handleSetPresence = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload: any = { name: form.name || " ", activity_type: form.activity_type };
      if (form.details) payload.details = form.details;
      if (form.state) payload.state = form.state;
      if (form.large_image_url) payload.large_image_url = form.large_image_url;
      if (form.large_text) payload.large_text = form.large_text;
      if (form.small_image_url) payload.small_image_url = form.small_image_url;
      if (form.small_text) payload.small_text = form.small_text;
      if (form.stream_url) payload.stream_url = form.stream_url;
      if (form.platform) payload.platform = form.platform;
      if (form.button1_label && form.button1_url) { payload.button1_label = form.button1_label; payload.button1_url = form.button1_url; }
      if (form.button2_label && form.button2_url) { payload.button2_label = form.button2_label; payload.button2_url = form.button2_url; }
      if (form.start) payload.start = parseInt(form.start);
      if (form.end) payload.end = parseInt(form.end);
      await setRichPresence(payload);
      setMessage("Rich presence set!");
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
            <button onClick={handleSetPresence} disabled={loading} className="btn btn-primary">
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
