"use client";

import { useEffect, useState } from "react";
import { FaDesktop, FaMobileScreen, FaVrCardboard, FaCheck, FaRotate } from "react-icons/fa6";
import { getDevicePresets, setDevicePreset } from "@/lib/api";

const presets = [
  { value: "desktop", label: "Desktop", desc: "Windows Chrome", icon: FaDesktop },
  { value: "mobile", label: "Mobile", desc: "Android Discord app", icon: FaMobileScreen },
  { value: "vr", label: "VR", desc: "Discord VR headset", icon: FaVrCardboard },
];

export default function DevicePage() {
  const [currentPreset, setCurrentPreset] = useState("desktop");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getDevicePresets()
      .then((d) => {
        setCurrentPreset(d.preset || d.current || "desktop");
        if (typeof d.enabled === "boolean") setEnabled(d.enabled);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePresetChange = async (preset: string) => {
    setSaving(true);
    setMessage("");
    try {
      await setDevicePreset(preset, enabled);
      setCurrentPreset(preset);
      setMessage("Device preset updated");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (next: boolean) => {
    setSaving(true);
    setMessage("");
    try {
      await setDevicePreset(currentPreset, next);
      setEnabled(next);
      setMessage(next ? "Device spoofing enabled" : "Device spoofing disabled - using your real device headers");
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ paddingTop: 20, color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>;

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Device spoofer</h1>
        <p>Changes how your account appears to Discord.</p>
      </div>

      {message && (
        <div className={`message ${message.includes("Error") ? "message-error" : "message-success"}`} style={{ marginBottom: 20 }}>
          <span>{message}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaDesktop style={{ fontSize: 11, opacity: 0.6 }} />
          Device spoofing
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: enabled ? 20 : 16 }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Enable device spoofing</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>
                Disable to connect with your real device headers
              </p>
            </div>
            <button
              onClick={() => handleToggle(!enabled)}
              disabled={saving}
              className={`toggle ${enabled ? "toggle-on" : "toggle-off"}`}
            >
              <span className="toggle-knob" />
            </button>
          </div>

          {!enabled && (
            <div className="message message-warning" style={{ marginBottom: 20 }}>
              <span>Spoofing is disabled - Discord will see your real device. Your chosen preset stays saved for when you re-enable.</span>
            </div>
          )}
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaRotate style={{ fontSize: 11, opacity: 0.6 }} />
          Device preset
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {presets.map((p) => {
              const active = enabled && currentPreset === p.value;
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  onClick={() => handlePresetChange(p.value)}
                  disabled={saving || !enabled}
                  className={active ? "option-btn option-btn-active" : "option-btn"}
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: 6, opacity: enabled ? 1 : 0.5 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Icon style={{ fontSize: 18, color: active ? "var(--accent)" : "var(--text-muted)" }} />
                    {active && <FaCheck style={{ fontSize: 11, color: "var(--accent)" }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.label}</div>
                    <div className="option-btn-desc">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
