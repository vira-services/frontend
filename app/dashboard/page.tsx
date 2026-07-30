"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBorderAll, FaTerminal, FaCircle, FaClock, FaCheck } from "react-icons/fa6";
import { getStats, getStatus, getCommands, completeOnboarding, getOnboardingStatus, restartInstance } from "@/lib/api";

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Token is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const discordId = localStorage.getItem("vira_discord_id") || "";
      await completeOnboarding(discordId, token.trim());
      localStorage.setItem("vira_onboarded", "true");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" style={{ animation: "fade-in 0.15s ease-out" }}>
      <div className="w-full max-w-md animate-scale-in" style={{
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        padding: 28,
        boxShadow: "var(--shadow-popover)",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>Welcome to vira</h2>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginBottom: 20, lineHeight: 1.5 }}>
          To complete your setup, please enter your selfbot account token.
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
              placeholder="Enter your token here..."
              style={{ width: "100%" }}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", paddingTop: 10, paddingBottom: 10 }}
          >
            {loading ? "Saving..." : "Complete setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [cmds, setCmds] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingParam = searchParams.get("onboarding") === "1";

    async function load() {
      try {
        const os = await getOnboardingStatus();

        if (onboardingParam || !os.has_token || !os.token_valid) {
          setShowOnboarding(true);
        } else if (!os.connected) {
          try {
            await restartInstance();
          } catch {}
        }

        const [s, st, c] = await Promise.all([
          getStats(),
          getStatus(),
          getCommands(),
        ]);
        setStats(s);
        setStatus(st);
        setCmds(c);
      } catch {}
      setLoading(false);
    }

    load();
  }, [searchParams]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    router.replace("/dashboard");
    getStats().then(setStats).catch(console.error);
    getStatus().then(setStatus).catch(console.error);
  };

  const connected = status?.connected ?? stats?.connected ?? false;
  const username = status?.username || stats?.username || "User";
  const avatar = status?.avatar_url || stats?.avatar || "";
  const prefix = stats?.prefix || "-";
  const uptime = status?.uptime || stats?.uptime_display || "0m";
  const userCount = stats?.users ?? 0;
  const cmdCount = typeof cmds?.categories?.length === "number" ? cmds.categories.length : 0;

  const shortcuts = [
    { label: "Commands", href: "/dashboard/commands", icon: FaTerminal, desc: "Browse available commands" },
    { label: "Rich presence", href: "/dashboard/rpc", icon: FaCompactDisc, desc: "Set your custom activity" },
    { label: "Webhook", href: "/dashboard/webhook", icon: FaPaperPlane, desc: "Configure command output" },
    { label: "Settings", href: "/dashboard/settings", icon: FaGear, desc: "Account & preferences" },
  ];

  return (
    <>
      {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}

      {loading ? (
        <div className="animate-stagger" style={{ paddingTop: 20 }}>
          <div style={{ height: 40, width: "60%", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", marginBottom: 24 }} />
          <div style={{ height: 100, background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)" }} />
        </div>
      ) : (
        <div className="animate-stagger">
          <div className="page-heading">
            <h1>Dashboard</h1>
            <p>Session overview, stats, and quick actions.</p>
          </div>

          <div className="page-section">
            <div className="section-title">
              <FaBorderAll style={{ fontSize: 11, opacity: 0.6 }} />
              Overview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Status</span>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "var(--success)" : "var(--danger)", boxShadow: connected ? "0 0 8px rgba(34,197,94,0.4)" : "none" }} />
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
                  {connected ? "Online" : "Offline"}
                </p>
              </div>

              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Uptime</span>
                  <FaClock style={{ fontSize: 12, color: "var(--text-muted)" }} />
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>{uptime}</p>
              </div>

              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Prefix</span>
                  <FaTerminal style={{ fontSize: 12, color: "var(--text-muted)" }} />
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, fontFamily: "monospace" }}>{prefix}</p>
              </div>

              <div className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>Categories</span>
                  <FaBorderAll style={{ fontSize: 12, color: "var(--text-muted)" }} />
                </div>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>{cmdCount}</p>
              </div>
            </div>
          </div>

          <div className="page-section">
            <div className="section-title">
              <FaCircle style={{ fontSize: 10, opacity: 0.6 }} />
              Session
            </div>
            <div className="card card-hover" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {avatar ? (
                  <img alt="" width="44" height="44" decoding="async" src={avatar} style={{ borderRadius: "var(--radius-md)", objectFit: "cover", border: "1px solid var(--border)" }} />
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--text-tertiary)" }}>
                    {username[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: connected ? "var(--success)" : "var(--text-tertiary)" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: connected ? "var(--success)" : "var(--text-muted)" }} />
                      {connected ? "Connected" : "Disconnected"}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>prefix: {prefix}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="page-section">
            <div className="section-title">
              <FaBorderAll style={{ fontSize: 11, opacity: 0.6 }} />
              Shortcuts
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              {shortcuts.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.href} href={s.href} onClick={(e) => { e.preventDefault(); router.push(s.href); }}
                    className="card card-hover"
                    style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon style={{ fontSize: 15, color: "var(--text-secondary)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{s.label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 1 }}>{s.desc}</p>
                    </div>
                    <FaChevronRight style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { FaCompactDisc, FaPaperPlane, FaGear, FaChevronRight } from "react-icons/fa6";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--text-tertiary)", fontSize: 14 }}>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
