"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleCallback } from "@/lib/api";

export default function CallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing authentication...");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setError("No authorization code received");
      return;
    }

    handleCallback(code)
      .then((data) => {
        if (data.jwt) {
          localStorage.setItem("vira_jwt", data.jwt);
          localStorage.setItem("vira_discord_id", data.discord_id || "");
          localStorage.setItem("vira_username", data.username || "");
          if (data.has_token) {
            localStorage.setItem("vira_onboarded", "true");
            router.push("/dashboard");
          } else {
            router.push("/dashboard?onboarding=1");
          }
        } else {
          setError("Invalid response from server");
        }
      })
      .catch((e) => {
        setError(e.message || "Authentication failed");
      });
  }, [router]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <h2 style={{ color: "var(--danger)", marginBottom: 12 }}>Authentication Failed</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{error}</p>
          <button onClick={() => router.push("/login")} style={{ background: "var(--accent)", color: "#fff", padding: "10px 24px" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <p style={{ color: "var(--text-secondary)" }}>{status}</p>
      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
