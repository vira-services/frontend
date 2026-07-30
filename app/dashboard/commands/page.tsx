"use client";

import { useEffect, useState } from "react";
import { FaTerminal, FaMagnifyingGlass } from "react-icons/fa6";
import { getCommands } from "@/lib/api";

export default function CommandsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCommands()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ paddingTop: 20, color: "var(--text-tertiary)", fontSize: 14 }}>Loading commands...</div>;

  const categories = data?.commands || data?.categories || [];
  const prefix = data?.prefix || "-";

  const filtered = Array.isArray(categories) ? categories.map((cat: any) => ({
    ...cat,
    commands: Array.isArray(cat.commands) ? cat.commands.filter((cmd: any) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const name = (cmd.name || cmd.command || "").toLowerCase();
      const desc = (cmd.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    }) : [],
  })).filter((cat: any) => cat.commands.length > 0) : [];

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Commands</h1>
        <p>Browse all available commands. Prefix: <code style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: "var(--radius-sm)", fontFamily: "monospace", fontSize: 12.5, color: "var(--accent)" }}>{prefix}</code></p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <FaMagnifyingGlass style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            style={{ width: "100%", paddingLeft: 36, maxWidth: 360 }}
          />
        </div>
      </div>

      <div className="page-section" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((cat: any, i: number) => (
          <div key={i} className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{cat.name || cat.category || `Category ${i + 1}`}</p>
            </div>
            <div>
              {cat.commands.map((cmd: any, j: number) => (
                <div
                  key={j}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 20px",
                    borderBottom: j < cat.commands.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <FaTerminal style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {prefix}{cmd.name || cmd.command || "?"}
                    </span>
                  </div>
                  <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", textAlign: "right", flexShrink: 0, maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {cmd.description || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <FaTerminal style={{ fontSize: 24 }} />
            <p>{search ? "No commands match your search." : "No commands available."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
