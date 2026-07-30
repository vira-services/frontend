"use client";

import { useState } from "react";
import { getAuthUrl } from "@/lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAuthUrl();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      } else {
        setError("Failed to get auth URL");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)", maxWidth: 420, width: "90%" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>V</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Vira</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 15 }}>
          Control panel for your selfbot
        </p>
        {error && (
          <div style={{ color: "var(--danger)", marginBottom: 16, fontSize: 14, background: "rgba(237,66,69,0.1)", padding: "8px 12px", borderRadius: 8 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 32px",
            fontSize: 16,
            width: "100%",
          }}
        >
          {loading ? "Loading..." : "Login with Discord"}
        </button>
      </div>
    </div>
  );
}
