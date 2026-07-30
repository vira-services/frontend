"use client";

import { useEffect, useState } from "react";
import { FaGear, FaFloppyDisk, FaTerminal } from "react-icons/fa6";
import { completeOnboarding, getModuleSettings, updateModuleSettings } from "@/lib/api";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prefix, setPrefix] = useState("");
  const [prefixLoading, setPrefixLoading] = useState(false);
  const [prefixOrig, setPrefixOrig] = useState("");

  useEffect(() => {
    getModuleSettings()
      .then((d) => {
        const p = d?.command_prefix || "-";
        setPrefix(p);
        setPrefixOrig(p);
      })
      .catch(() => {});
  }, []);

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Token is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const discordId = localStorage.getItem("vira_discord_id") || "";
      await completeOnboarding(discordId, token.trim());
      setSuccess("Token updated successfully! Restart your gateway to apply.");
      setToken("");
    } catch (err: any) {
      setError(err.message || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrefix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefix.trim()) return;
    setPrefixLoading(true);
    setError("");
    setSuccess("");
    try {
      await updateModuleSettings({ command_prefix: prefix.trim() });
      setPrefixOrig(prefix.trim());
      setSuccess(`Prefix changed to "${prefix.trim()}"`);
    } catch (err: any) {
      setError(err.message || "Failed to update prefix");
    } finally {
      setPrefixLoading(false);
    }
  };

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Manage your account preferences.</p>
      </div>

      {error && (
        <div className="message message-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="message message-success" style={{ marginBottom: 16 }}>
          <span>{success}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaTerminal style={{ fontSize: 11, opacity: 0.6 }} />
          Command prefix
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Prefix</p>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5 }}>
              Change your personal command prefix. Other users are unaffected.
            </p>
          </div>
          <form onSubmit={handleSavePrefix} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div>
              <label className="form-label">Prefix</label>
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="-"
                style={{ width: 100 }}
                maxLength={16}
              />
            </div>
            <button
              type="submit"
              disabled={prefixLoading || !prefix.trim() || prefix.trim() === prefixOrig}
              className="btn btn-primary"
              style={{ height: 36 }}
            >
              <FaFloppyDisk style={{ fontSize: 12 }} />
              {prefixLoading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaGear style={{ fontSize: 11, opacity: 0.6 }} />
          Account
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>Discord token</p>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5 }}>
              Update the Discord token used by your selfbot. This will replace your current token.
            </p>
          </div>

          <form onSubmit={handleSaveToken} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">New token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter new token..."
                style={{ width: "100%", maxWidth: 400 }}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="btn btn-primary"
              >
                <FaFloppyDisk style={{ fontSize: 12 }} />
                {loading ? "Saving..." : "Update token"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
