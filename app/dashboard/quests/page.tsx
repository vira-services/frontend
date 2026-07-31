"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaListCheck,
  FaPlay,
  FaStop,
  FaForward,
  FaTrophy,
  FaCircleNodes,
  FaCoins,
  FaCircleInfo,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { getQuestsStatus, startQuests, stopQuests, skipQuests } from "@/lib/api";

interface QuestRunner {
  running: boolean;
  phase: string;
  completed_total: number;
  enrolled_total: number;
  queued_names: string[];
  queued_count: number;
  current_quest_id: number | string | null;
  current_quest_name: string | null;
  current_quest_type: number | string | null;
  current_percent: number;
  last_error: string | null;
  last_run_summary: Record<string, any> | null;
  last_message: string | null;
}

interface QuestCounts {
  total: number;
  enrollable: number;
  completeable: number;
  claimable: number;
  worthy_incomplete: number;
  orb_balance: number;
  runner: QuestRunner;
  api_error: string | null;
  debug: string[];
}

interface QuestsStatus {
  connected: boolean;
  counts: QuestCounts;
}

const PHASE_META: Record<string, { label: string; cls: string }> = {
  idle: { label: "Idle", cls: "badge-neutral" },
  starting: { label: "Starting", cls: "badge-accent" },
  working: { label: "Working", cls: "badge-success" },
  done: { label: "Done", cls: "badge-success" },
  skipped: { label: "Skipped", cls: "badge-warning" },
  stopped: { label: "Stopped", cls: "badge-neutral" },
  cancelled: { label: "Cancelled", cls: "badge-neutral" },
  error: { label: "Error", cls: "badge-danger" },
};

const EMPTY_COUNTS: QuestCounts = {
  total: 0,
  enrollable: 0,
  completeable: 0,
  claimable: 0,
  worthy_incomplete: 0,
  orb_balance: 0,
  runner: {
    running: false,
    phase: "idle",
    completed_total: 0,
    enrolled_total: 0,
    queued_names: [],
    queued_count: 0,
    current_quest_id: null,
    current_quest_name: null,
    current_quest_type: null,
    current_percent: 0,
    last_error: null,
    last_run_summary: null,
    last_message: null,
  },
  api_error: null,
  debug: [],
};

function StatCell({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "16px 18px", flex: "1 1 160px", minWidth: 140 }}>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.02em" }}>
        {icon}
        {label}
      </p>
      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </p>
    </div>
  );
}

export default function QuestsPage() {
  const [status, setStatus] = useState<QuestsStatus>({ connected: false, counts: EMPTY_COUNTS });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const runner = status.counts?.runner ?? EMPTY_COUNTS.runner;
  const counts = status.counts ?? EMPTY_COUNTS;
  const phaseMeta = PHASE_META[runner.phase] ?? PHASE_META.idle;
  const running = Boolean(runner.running);
  const percent = Math.min(100, Math.max(0, Number(runner.current_percent) || 0));

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getQuestsStatus();
      if (data?.counts) setStatus(data);
    } catch {
      // keep last known state on transient errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 4000);
    return () => clearInterval(timer);
  }, [fetchStatus]);

  const act = async (label: string, fn: () => Promise<any>, successMsg: string) => {
    setBusy(label);
    setMessage(null);
    try {
      const res = await fn();
      if (res && res.ok === false) {
        setMessage({ type: "error", text: res.detail || "Request failed" });
      } else {
        setMessage({ type: "success", text: successMsg });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Request failed" });
    } finally {
      setBusy(null);
      setTimeout(fetchStatus, 800);
    }
  };

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Quests</h1>
        <p>Auto-complete Discord quests while you're away.</p>
      </div>

      {message && (
        <div className={`message ${message.type === "error" ? "message-error" : "message-success"}`} style={{ marginBottom: 16 }}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="page-section">
        <div className="section-title">
          <FaCircleNodes style={{ fontSize: 11, opacity: 0.6 }} />
          Connection
        </div>
        <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: status.connected ? "#2ECC71" : "#E74C3C",
              flexShrink: 0,
            }}
          />
          <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
            {status.connected ? "Gateway connected" : "Gateway not connected"}
          </p>
          {counts.api_error && (
            <p style={{ fontSize: 12, color: "var(--danger)", flex: "1 1 100%" }}>{counts.api_error}</p>
          )}
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaListCheck style={{ fontSize: 11, opacity: 0.6 }} />
          Quest runner
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span className={`badge ${phaseMeta.cls}`}>{phaseMeta.label}</span>
              {running && (
                <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
                  {runner.current_quest_name || "Scanning quests..."}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                disabled={!status.connected || running || busy !== null}
                onClick={() => act("start", startQuests, "Quest runner started.")}
                style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}
              >
                <FaPlay style={{ fontSize: 10 }} />
                {busy === "start" ? "Starting..." : "Start"}
              </button>
              <button
                className="btn btn-secondary"
                disabled={!running || busy !== null}
                onClick={() => act("skip", skipQuests, "Current quest skipped.")}
                style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}
              >
                <FaForward style={{ fontSize: 10 }} />
                Skip
              </button>
              <button
                className="btn btn-danger"
                disabled={!running || busy !== null}
                onClick={() => act("stop", stopQuests, "Quest runner stopped.")}
                style={{ height: 32, padding: "0 14px", fontSize: 12.5 }}
              >
                <FaStop style={{ fontSize: 10 }} />
                Stop
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
                Completed: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{runner.completed_total}</span>
              </p>
              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
                Enrolled: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{runner.enrolled_total}</span>
              </p>
              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
                Queue: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{runner.queued_count}</span>
              </p>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: "var(--bg-elevated)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percent}%`,
                  borderRadius: 999,
                  background: "var(--accent)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            {runner.current_percent > 0 && (
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {percent.toFixed(0)}%
              </p>
            )}
          </div>

          {runner.queued_names && runner.queued_names.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Queued quests</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {runner.queued_names.slice(0, 20).map((name, i) => (
                  <span key={i} className="badge badge-neutral" style={{ fontSize: 11, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {name}
                  </span>
                ))}
                {runner.queued_names.length > 20 && (
                  <span className="badge badge-neutral" style={{ fontSize: 11 }}>
                    +{runner.queued_names.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          {runner.last_message && (
            <div className="message message-warning" style={{ marginTop: 16, marginBottom: 0 }}>
              <span>{runner.last_message}</span>
            </div>
          )}
          {runner.last_error && (
            <div className="message message-error" style={{ marginTop: 16, marginBottom: 0 }}>
              <span>{runner.last_error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="page-section">
        <div className="section-title">
          <FaTrophy style={{ fontSize: 11, opacity: 0.6 }} />
          Overview
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <StatCell label="Orb balance" value={counts.orb_balance} icon={<FaCoins style={{ fontSize: 11, color: "var(--accent)" }} />} />
          <StatCell label="Total quests" value={counts.total} icon={<FaTrophy style={{ fontSize: 11, color: "var(--accent)" }} />} />
          <StatCell label="Enrollable" value={counts.enrollable} />
          <StatCell label="In progress" value={counts.completeable} />
          <StatCell label="Claimable" value={counts.claimable} />
          <StatCell label="Worth finishing" value={counts.worthy_incomplete} />
        </div>
        {loading && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>Loading quest data...</p>
        )}
        {counts.debug && counts.debug.length > 0 && (
          <div className="message message-info" style={{ marginTop: 16, marginBottom: 0 }}>
            <FaCircleInfo style={{ fontSize: 12 }} />
            <span>{counts.debug.join(" · ")}</span>
          </div>
        )}
        {!status.connected && counts.api_error && (
          <div className="message message-warning" style={{ marginTop: 16, marginBottom: 0 }}>
            <FaTriangleExclamation style={{ fontSize: 12 }} />
            <span>Sign in from the dashboard to enable quest automation.</span>
          </div>
        )}
      </div>
    </div>
  );
}
