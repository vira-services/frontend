"use client";

import { useEffect, useRef, useState } from "react";
import { FaTriangleExclamation, FaSpinner } from "react-icons/fa6";
import { getOnboardingStatus, completeOnboarding } from "@/lib/api";

const POLL_MS = 20000;

export default function TokenGate() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const checking = useRef(false);

  const checkToken = async () => {
    if (checking.current) return;
    checking.current = true;
    try {
      const os = await getOnboardingStatus();
      if (os?.has_token && os?.token_valid === false) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    } catch {
      setOpen(false);
    } finally {
      checking.current = false;
    }
  };

  useEffect(() => {
    checkToken();
    const id = setInterval(checkToken, POLL_MS);
    const onFocus = () => checkToken();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      const discordId = localStorage.getItem("vira_discord_id") || "";
      await completeOnboarding(discordId, token.trim());
      setToken("");
      await checkToken();
    } catch (err: any) {
      setError(err.message || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", animation: "fade-in 0.2s ease-out" }}
    >
      <div className="w-full max-w-md animate-scale-in" style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        padding: 28,
        boxShadow: "var(--shadow-popover)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <FaTriangleExclamation style={{ fontSize: 15, color: "var(--danger)", flexShrink: 0 }} />
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>Token no longer valid</h2>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginBottom: 20, lineHeight: 1.5 }}>
          Your Discord token has been rejected or revoked. Enter a fresh token to re-authenticate your session.
        </p>

        {error && (
          <div className="message message-error" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5 }}>Discord token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter a fresh token here..."
              style={{ width: "100%" }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="btn btn-primary"
            style={{ width: "100%", paddingTop: 10, paddingBottom: 10 }}
          >
            {loading ? (
              <>
                <FaSpinner style={{ fontSize: 12, animation: "spin 1s linear infinite" }} />
                Re-authenticating...
              </>
            ) : (
              "Update token"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
