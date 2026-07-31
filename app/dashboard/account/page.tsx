"use client";

import { useEffect, useState } from "react";
import { FaUser, FaCircleCheck, FaCircleXmark, FaRobot, FaFingerprint, FaHashtag, FaKey, FaChevronRight, FaSpinner } from "react-icons/fa6";
import { getStatus, getOnboardingStatus, getBots } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [os, setOs] = useState<any>(null);
  const [botCount, setBotCount] = useState<number | null>(null);
  const [username, setUsername] = useState("User");
  const [discordId, setDiscordId] = useState("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUsername(localStorage.getItem("vira_username") || "User");
    setDiscordId(localStorage.getItem("vira_discord_id") || "—");
    async function load() {
      try {
        const [s, o, b] = await Promise.all([
          getStatus(),
          getOnboardingStatus(),
          getBots().catch(() => []),
        ]);
        setStatus(s);
        setOs(o);
        setBotCount(Array.isArray(b) ? b.length : 0);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const connected = !!status?.connected;
  const avatar = status?.avatar_url || "";
  const tokenValid = os?.token_valid;
  const hasToken = os?.has_token;

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Account</h1>
        <p>Your selfbot identity, connection state, and token status.</p>
      </div>

      {loading ? (
        <div style={{ padding: "24px 0", display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 14 }}>
          <FaSpinner style={{ fontSize: 12, animation: "spin 1s linear infinite" }} />
          Loading account...
        </div>
      ) : (
        <>
          <div className="page-section">
            <div className="section-title">
              <FaUser style={{ fontSize: 11, opacity: 0.6 }} />
              Profile
            </div>
            <div className="card" style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {avatar ? (
                  <img
                    alt=""
                    width="56"
                    height="56"
                    decoding="async"
                    src={avatar}
                    style={{ borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--border)" }}
                  />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "var(--text-tertiary)" }}>
                    {username[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, fontSize: 12, color: "var(--text-tertiary)" }}>
                    <FaHashtag style={{ fontSize: 10, opacity: 0.6 }} />
                    <span style={{ fontFamily: "monospace" }}>{discordId}</span>
                  </div>
                </div>
                <span className={`badge ${connected ? "badge-success" : "badge-danger"}`}>
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          <div className="page-section">
            <div className="section-title">
              <FaFingerprint style={{ fontSize: 11, opacity: 0.6 }} />
              Session
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Token</span>
                  {hasToken === undefined ? (
                    <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite", color: "var(--text-muted)" }} />
                  ) : tokenValid === true ? (
                    <FaCircleCheck style={{ fontSize: 12, color: "var(--success)" }} />
                  ) : tokenValid === false ? (
                    <FaCircleXmark style={{ fontSize: 12, color: "var(--danger)" }} />
                  ) : (
                    <FaKey style={{ fontSize: 11, color: "var(--text-muted)" }} />
                  )}
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.1 }}>
                  {hasToken ? (tokenValid === false ? "Invalid" : "Valid") : "No token"}
                </p>
              </div>

              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Bots</span>
                  <FaRobot style={{ fontSize: 12, color: "var(--text-muted)" }} />
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.1 }}>{botCount ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="page-section">
            <a
              href="/dashboard/settings"
              onClick={(e) => { e.preventDefault(); router.push("/dashboard/settings"); }}
              className="card card-hover"
              style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FaKey style={{ fontSize: 14, color: "var(--text-secondary)" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>Update token</p>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>Replace your selfbot token if it&apos;s been revoked.</p>
              </div>
              <FaChevronRight style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }} />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
