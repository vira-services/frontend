"use client";

import { useState } from "react";
import { FaGear, FaFloppyDisk } from "react-icons/fa6";
import { completeOnboarding } from "@/lib/api";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Token is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const discordId = localStorage.getItem("vira_discord_id") || "";
      await completeOnboarding(discordId, token.trim());
      setSuccess(true);
      setToken("");
    } catch (err: any) {
      setError(err.message || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Settings</h1>
        <p>Manage your account token and other preferences.</p>
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

          {error && (
            <div className="message message-error" style={{ marginBottom: 16 }}>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="message message-success" style={{ marginBottom: 16 }}>
              <span>Token updated successfully! Your bot will restart automatically if connected.</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
