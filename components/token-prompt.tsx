"use client";

import { useState } from "react";

interface TokenPromptProps {
  onSave: (token: string) => Promise<void>;
}

export default function TokenPrompt({ onSave }: TokenPromptProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onSave(token.trim());
    } catch (e: any) {
      setError(e.message || "Failed to save token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <form onSubmit={handleSubmit} style={{ padding: "40px", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", maxWidth: 480, width: "90%" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Enter Your Discord Token</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          This is required to connect the selfbot to your Discord account. Your token is stored locally and sent to the API.
        </p>
        {error && (
          <div style={{ color: "var(--danger)", marginBottom: 16, fontSize: 14, background: "rgba(237,66,69,0.1)", padding: "8px 12px", borderRadius: 8 }}>
            {error}
          </div>
        )}
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your Discord token here"
          style={{ width: "100%", marginBottom: 16 }}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !token.trim()}
          style={{
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 24px",
            fontSize: 15,
            width: "100%",
          }}
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
      </form>
    </div>
  );
}
