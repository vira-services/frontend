"use client";

import { useEffect, useState } from "react";
import { getCommands } from "@/lib/api";

export default function CommandsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommands()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: "var(--text-tertiary)", fontSize: 14, padding: "40px 0" }}>Loading commands...</div>;

  const commands = data?.commands || data?.categories || [];
  const prefix = data?.prefix || "-";

  return (
    <div className="animate-stagger-in space-y-6 pb-10">
      <header className="animate-fade-up">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Extras</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">Commands</h1>
        <p className="mt-2 text-[0.95rem] text-[#8a8a92]">
          Prefix: <code style={{ background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 6, fontFamily: "monospace", fontSize: 13 }}>{prefix}</code>
        </p>
      </header>

      {Array.isArray(commands) ? (
        commands.map((cat: any, i: number) => (
          <section key={i} className="dash-v2-panel p-4 sm:p-5 md:p-6">
            <h2 className="text-sm font-semibold tracking-tight text-white/90 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
              {cat.name || cat.category || `Category ${i + 1}`}
            </h2>
            {Array.isArray(cat.commands) ? (
              <div className="space-y-1">
                {cat.commands.map((cmd: any, j: number) => (
                  <div key={j} className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-[#0a0a0c]">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="truncate text-sm font-medium text-[#e4e4e7]">{prefix}{cmd.name || cmd.command || "?"}</span>
                    </div>
                    <span className="shrink-0 text-xs text-[#71717a]">{cmd.description || ""}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-[#71717a]">No commands in this category</div>
            )}
          </section>
        ))
      ) : (
        <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
          <pre style={{ fontSize: 13, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}
