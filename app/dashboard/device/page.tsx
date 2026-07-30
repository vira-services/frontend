"use client";

import { useEffect, useState } from "react";
import { getDevicePresets, setDevicePreset, getRotatorConfig, saveRotatorConfig } from "@/lib/api";

export default function DevicePage() {
  const [currentPreset, setCurrentPreset] = useState("desktop");
  const [rotator, setRotator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const presets = [
    { value: "desktop", label: "Desktop", desc: "Windows Chrome" },
    { value: "mobile", label: "Mobile", desc: "Android Discord app" },
    { value: "vr", label: "VR", desc: "Discord VR headset" },
  ];

  useEffect(() => {
    Promise.all([getDevicePresets(), getRotatorConfig()])
      .then(([d, r]) => {
        setCurrentPreset(d.preset || d.current || "desktop");
        setRotator(r);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePresetChange = async (preset: string) => {
    setSaving(true);
    setMessage("");
    try {
      await setDevicePreset(preset);
      setCurrentPreset(preset);
      setMessage("Device preset updated");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRotatorSave = async () => {
    if (!rotator) return;
    setSaving(true);
    setMessage("");
    try {
      await saveRotatorConfig(rotator);
      setMessage("Rotator config saved");
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
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Discord</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">Device Spoofer</h1>
        <p className="mt-2 text-[0.95rem] text-[#8a8a92]">Changes how your account appears to Discord</p>
      </header>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 12, marginBottom: 0,
          background: message.includes("Error") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          color: message.includes("Error") ? "var(--danger)" : "var(--success)",
          fontSize: 14, border: `1px solid ${message.includes("Error") ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
        }}>
          {message}
        </div>
      )}

      <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
        <h2 className="text-sm font-semibold tracking-tight text-white/90 mb-4">Device Preset</h2>
        <div className="space-y-2.5">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePresetChange(p.value)}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                padding: "14px 18px", borderRadius: 12, textAlign: "left", fontSize: 14,
                background: currentPreset === p.value ? "rgba(139,92,246,0.15)" : "var(--bg-secondary)",
                color: currentPreset === p.value ? "#fff" : "var(--text-primary)",
                border: currentPreset === p.value ? "1px solid rgba(139,92,246,0.3)" : "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: "var(--text-tertiary)" }}>{p.desc}</div>
              </div>
              {currentPreset === p.value && <span style={{ fontSize: 18, color: "var(--accent)" }}>✓</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="text-sm font-semibold tracking-tight text-white/90">Status Rotator</h2>
          <button
            onClick={handleRotatorSave}
            disabled={saving || !rotator}
            style={{
              background: "rgba(255,255,255,0.08)", color: "var(--text-primary)",
              padding: "8px 20px", fontSize: 13, fontWeight: 500,
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <p className="text-sm text-[#8a8a92] mb-4">Automatically rotates your online status between presets</p>
        {rotator && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Enabled</label>
              <input
                type="checkbox"
                checked={rotator.enabled || false}
                onChange={(e) => setRotator({ ...rotator, enabled: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: "var(--accent)" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Interval (seconds)</label>
              <input
                type="number"
                value={rotator.interval_seconds || 60}
                onChange={(e) => setRotator({ ...rotator, interval_seconds: parseInt(e.target.value) || 60 })}
                style={{ width: 120 }}
              />
            </div>
            {Array.isArray(rotator.slots) && rotator.slots.length > 0 && (
              <div>
                <label style={{ fontSize: 14, color: "var(--text-tertiary)", display: "block", marginBottom: 8 }}>Slots</label>
                {rotator.slots.map((slot: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={slot.status || ""}
                      onChange={(e) => {
                        const slots = [...rotator.slots];
                        slots[i] = { ...slot, status: e.target.value };
                        setRotator({ ...rotator, slots });
                      }}
                      placeholder="online/idle/dnd/invisible"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const slots = rotator.slots.filter((_: any, j: number) => j !== i);
                        setRotator({ ...rotator, slots });
                      }}
                      style={{ background: "transparent", color: "var(--danger)", padding: "8px 12px", fontSize: 13 }}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setRotator({ ...rotator, slots: [...(rotator.slots || []), { status: "online" }] })}
              style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", padding: "8px 16px", fontSize: 13, border: "1px dashed var(--border)", marginTop: 4 }}
            >
              + Add Slot
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
