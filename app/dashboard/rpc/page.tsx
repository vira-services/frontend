"use client";

import { useEffect, useState } from "react";
import { setRichPresence, clearPresence, getPlatforms } from "@/lib/api";

const activityTypes = [
  { value: 0, label: "Playing" },
  { value: 1, label: "Streaming" },
  { value: 2, label: "Listening" },
  { value: 3, label: "Watching" },
  { value: 4, label: "Competing" },
  { value: 5, label: "Custom" },
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
    return <div style={{ color: "var(--text-tertiary)", fontSize: 14, padding: "40px 0" }}>Loading...</div>;
  }

  return (
    <div className="animate-stagger-in space-y-6 pb-10">
      <header className="animate-fade-up">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Discord</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">Rich Presence</h1>
        <p className="mt-2 text-[0.95rem] text-[#8a8a92]">Set your Discord rich presence</p>
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold tracking-tight text-white/90">Rich Presence</h2>
          <button onClick={handleClear} disabled={loading} style={{ background: "transparent", color: "var(--text-tertiary)", padding: "8px 16px", fontSize: 13, border: "1px solid var(--border)" }}>
            Clear
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Activity Type</label>
          <select value={form.activity_type} onChange={(e) => setField("activity_type", parseInt(e.target.value))} style={{ width: "100%" }}>
            {activityTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Application Name</label>
          <input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="e.g. Visual Studio Code" style={{ width: "100%" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Details</label>
            <input value={form.details} onChange={(e) => setField("details", e.target.value)} placeholder="Top line text" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>State</label>
            <input value={form.state} onChange={(e) => setField("state", e.target.value)} placeholder="Bottom line text" style={{ width: "100%" }} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Stream URL (for Streaming type)</label>
          <input value={form.stream_url} onChange={(e) => setField("stream_url", e.target.value)} placeholder="https://twitch.tv/..." style={{ width: "100%" }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Platform</label>
          <select value={form.platform} onChange={(e) => setField("platform", e.target.value)} style={{ width: "100%" }}>
            <option value="">None</option>
            {platforms?.platforms?.map((p: any) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Images</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Large Image URL</label>
            <input value={form.large_image_url} onChange={(e) => setField("large_image_url", e.target.value)} placeholder="Image URL or key" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Large Image Tooltip</label>
            <input value={form.large_text} onChange={(e) => setField("large_text", e.target.value)} placeholder="Hover text" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Small Image URL</label>
            <input value={form.small_image_url} onChange={(e) => setField("small_image_url", e.target.value)} placeholder="Image URL or key" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Small Image Tooltip</label>
            <input value={form.small_text} onChange={(e) => setField("small_text", e.target.value)} placeholder="Hover text" style={{ width: "100%" }} />
          </div>
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Buttons</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Button 1 Label</label>
            <input value={form.button1_label} onChange={(e) => setField("button1_label", e.target.value)} placeholder="Button text" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Button 1 URL</label>
            <input value={form.button1_url} onChange={(e) => setField("button1_url", e.target.value)} placeholder="https://..." style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Button 2 Label</label>
            <input value={form.button2_label} onChange={(e) => setField("button2_label", e.target.value)} placeholder="Button text" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Button 2 URL</label>
            <input value={form.button2_url} onChange={(e) => setField("button2_url", e.target.value)} placeholder="https://..." style={{ width: "100%" }} />
          </div>
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, margin: "20px 0 12px", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Timestamps (Unix ms)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Start Time</label>
            <input value={form.start} onChange={(e) => setField("start", e.target.value)} placeholder="e.g. 1700000000000" style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>End Time</label>
            <input value={form.end} onChange={(e) => setField("end", e.target.value)} placeholder="e.g. 1700003600000" style={{ width: "100%" }} />
          </div>
        </div>

        <button onClick={handleSetPresence} disabled={loading} style={{ background: "var(--accent)", color: "#fff", padding: "10px 24px", fontSize: 14, marginTop: 8 }}>
          {loading ? "Sending..." : "Set Presence"}
        </button>
      </section>
    </div>
  );
}
