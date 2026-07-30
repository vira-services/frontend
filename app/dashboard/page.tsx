"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStats, getStatus, getCommands } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [cmds, setCmds] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getStatus(), getCommands()])
      .then(([s, st, c]) => {
        setStats(s);
        setStatus(st);
        setCmds(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const connected = status?.connected ?? false;
  const username = status?.username || stats?.username || "User";
  const avatar = status?.avatar_url || stats?.avatar || "";
  const prefix = stats?.prefix || "-";
  const uptime = stats?.uptime || status?.uptime || "0m";
  const cmdCount = cmds?.commands?.length || cmds?.categories?.length || 0;

  const shortcuts = [
    { label: "Commands", href: "/dashboard/commands", icon: "M1.5 3L3 1.5H21L22.5 3V21L21 22.5H3L1.5 21V3ZM3 3V21H21V3H3ZM7.06078 7.49988L6.00012 8.56054L10.2427 12.8032L6 17.0459L7.06066 18.1066L12 13.1673V12.4391L7.06078 7.49988Z M12 16.5h6v1.5h-6z" },
    { label: "Webhook", href: "/dashboard/webhook", icon: "M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z" },
    { label: "Rich Presence", href: "/dashboard/rpc", icon: "M192 64C86 64 0 150 0 256S86 448 192 448l256 0c106 0 192-86 192-192s-86-192-192-192L192 64zM496 168a40 40 0 1 1 0 80 40 40 0 1 1 0-80zM392 304a40 40 0 1 1 80 0 40 40 0 1 1 -80 0zM168 200c0-13.3 10.7-24 24-24s24 10.7 24 24l0 32 32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0 0 32c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-32-32 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l32 0 0-32z" },
    { label: "Device", href: "/dashboard/device", icon: "M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z" },
  ];

  if (loading) {
    return (
      <div className="animate-stagger-in space-y-7 pb-10">
        <div style={{ height: 80 }} />
        <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="animate-stagger-in space-y-7 pb-10">
      <header className="animate-fade-up">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Overview</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">{username}</h1>
        <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-[#8a8a92]">Live session stats, commands, and shortcuts.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="dash-v2-panel p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[0.75rem] text-[var(--text-tertiary)]">Uptime</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/35"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-white">{uptime}</p>
        </div>
        <div className="dash-v2-panel p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[0.75rem] text-[var(--text-tertiary)]">Commands</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/35"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-white">{cmdCount}</p>
        </div>
        <div className="dash-v2-panel p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[0.75rem] text-[var(--text-tertiary)]">Prefix</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/35"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-white font-mono">{prefix}</p>
        </div>
        <div className={`dash-v2-panel p-4 ${connected ? "" : "border-red-500/20 bg-red-500/[0.04]"}`}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[0.75rem] text-[var(--text-tertiary)]">Status</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 ${connected ? "text-emerald-400" : "text-white/35"}`}><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
          </div>
          <p className="text-xl font-semibold tracking-tight text-white">{connected ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 space-y-4">
          <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/90">Session</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-medium ${connected ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-red-500/25 bg-red-500/10 text-red-300"}`}>
                <span className={`size-1.5 rounded-full ${connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" : "bg-red-400"}`} />
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex items-center gap-3.5">
              {avatar ? (
                <img alt="" width="48" height="48" decoding="async" src={avatar} className="h-12 w-12 rounded-2xl border border-white/[0.1] object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-2xl border border-white/[0.1] bg-[var(--bg-secondary)] flex items-center justify-center text-lg font-bold text-[var(--text-tertiary)]">
                  {username[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">{username}</p>
                <p className="mt-0.5 font-mono text-xs text-[#71717a]">prefix {prefix}</p>
              </div>
            </div>
          </section>


        </div>

        <div className="space-y-4">
          <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-sm font-medium tracking-tight text-white/90 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-white/40"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
              Shortcuts
            </h2>
            <div className="space-y-1.5">
              {shortcuts.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  onClick={(e) => { e.preventDefault(); router.push(s.href); }}
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0a0a0c] p-3 text-white no-underline transition duration-300 hover:border-white/[0.14] hover:bg-[#121216]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] bg-[#141418] text-[#a1a1aa] transition-colors group-hover:border-white/[0.14] group-hover:text-white">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                      <path d={s.icon} />
                    </svg>
                  </span>
                  <span className="flex-1 text-sm font-medium">{s.label}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-[#3f3f46] transition-all group-hover:translate-x-0.5 group-hover:text-[#a1a1aa]"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
