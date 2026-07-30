"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiMonitor, FiCircle, FiDisc, FiSend, FiTerminal, FiLogOut, FiChevronDown, FiRefreshCw } from "react-icons/fi";
import { logoutUser } from "@/lib/api";

interface NavGroup {
  label: string;
  items: { label: string; path: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", path: "/dashboard", Icon: FiGrid },
    ],
  },
  {
    label: "Discord",
    items: [
      { label: "Device", path: "/dashboard/device", Icon: FiMonitor },
      { label: "Rotator", path: "/dashboard/rotator", Icon: FiRefreshCw },
      { label: "Status", path: "/dashboard/status", Icon: FiCircle },
      { label: "Rich Presence", path: "/dashboard/rpc", Icon: FiDisc },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Webhook", path: "/dashboard/webhook", Icon: FiSend },
    ],
  },
  {
    label: "Extras",
    items: [
      { label: "Commands", path: "/dashboard/commands", Icon: FiTerminal },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem("vira_jwt");
    router.push("/");
  };

  return (
    <aside
      className="lg-chrome pointer-events-auto fixed z-40 hidden flex-col overflow-visible transition-all duration-300 md:flex"
      style={{
        top: "var(--sidebar-inset)",
        bottom: "var(--sidebar-inset)",
        left: "var(--sidebar-inset)",
        borderRadius: "1.65rem",
        width: "var(--sidebar-w)",
      }}
    >
      <div className="relative z-[1] flex h-full flex-col" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="flex shrink-0 items-center gap-2.5 px-3 pt-3 pb-2 justify-between">
          <a className="flex min-w-0 items-center gap-2.5 rounded-2xl transition-opacity hover:opacity-90 flex-1" href="/dashboard">
            <div style={{ width: 32, height: 32, background: "var(--accent)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#fff" }}>V</div>
            <span className="min-w-0 overflow-hidden transition-all duration-300 w-auto opacity-100">
              <span className="block truncate text-[0.9rem] font-semibold tracking-tight text-white">Vira</span>
              <span className="block text-[0.62rem] text-zinc-600">Selfbot</span>
            </span>
          </a>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2 scrollbar-thin">
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label} className="mb-2">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="mb-0.5 flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[#52525b] hover:text-[#a1a1aa] justify-between"
                >
                  <span>{group.label}</span>
                  <FiChevronDown
                    className="text-base transition-transform"
                    style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }}
                  />
                </button>
                {!isCollapsed && (
                  <div>
                    {group.items.map((item) => {
                      const active = pathname === item.path;
                      const Icon = item.Icon;
                      return (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={(e) => { e.preventDefault(); router.push(item.path); }}
                          className={`dash-nav-item mb-0.5 justify-start ${active ? "is-active" : ""}`}
                        >
                          <Icon className="shrink-0 text-[1.15rem]" />
                          <span className="overflow-hidden whitespace-nowrap transition-all duration-300 w-auto opacity-100">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="relative z-50 shrink-0 space-y-1.5 border-t border-white/[0.06] px-2.5 py-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="dash-nav-item justify-start w-full"
            style={{ color: "var(--danger)" }}
          >
            <FiLogOut className="shrink-0 text-[1.15rem]" />
            <span className="overflow-hidden whitespace-nowrap transition-all duration-300 w-auto opacity-100">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
