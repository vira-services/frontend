"use client";

import { useEffect, useState } from "react";
import { FaDesktop, FaMobileScreen, FaVrCardboard, FaCheck, FaRotate, FaFloppyDisk } from "react-icons/fa6";
import { getDevicePresets, setDevicePreset } from "@/lib/api";

const presets = [
  { value: "desktop", label: "Desktop", desc: "Windows Chrome", icon: FaDesktop },
  { value: "mobile", label: "Mobile", desc: "Android Discord app", icon: FaMobileScreen },
  { value: "vr", label: "VR", desc: "Discord VR headset", icon: FaVrCardboard },
];

export default function DevicePage() {
  const [currentPreset, setCurrentPreset] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getDevicePresets()
      .then((d) => {
        setCurrentPreset(d.preset || d.current || "desktop");
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
          Device preset
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            {presets.map((p) => {
              const active = currentPreset === p.value;
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  onClick={() => handlePresetChange(p.value)}
                  disabled={saving}
                  className={active ? "option-btn option-btn-active" : "option-btn"}
                  style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}
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
