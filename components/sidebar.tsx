"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaBorderAll, FaDesktop, FaRotate, FaCircle, FaCompactDisc, FaPaperPlane, FaTerminal, FaBolt, FaRightFromBracket, FaChevronDown } from "react-icons/fa6";
import { logoutUser } from "@/lib/api";

interface NavGroup {
  label: string;
  items: { label: string; path: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Overview", path: "/dashboard", Icon: FaBorderAll },
    ],
  },
  {
    label: "Discord",
    items: [
      { label: "Device", path: "/dashboard/device", Icon: FaDesktop },
      { label: "Rotator", path: "/dashboard/rotator", Icon: FaRotate },
      { label: "Status", path: "/dashboard/status", Icon: FaCircle },
      { label: "Rich presence", path: "/dashboard/rpc", Icon: FaCompactDisc },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Webhook", path: "/dashboard/webhook", Icon: FaPaperPlane },
    ],
  },
  {
    label: "Extras",
    items: [
      { label: "Commands", path: "/dashboard/commands", Icon: FaTerminal },
    ],
  },
  {
    label: "Bot",
    items: [
      { label: "Customize", path: "/dashboard/customize", Icon: FaBolt },
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
    router.push("/login");
  };

  return (
    <aside
      className="pointer-events-auto fixed z-40 hidden flex-col overflow-visible transition-all duration-300 md:flex"
      style={{
        top: "var(--sidebar-inset)",
        bottom: "var(--sidebar-inset)",
        left: "var(--sidebar-inset)",
        borderRadius: "var(--radius-xl)",
        width: "var(--sidebar-w)",
        border: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <div className="relative z-[1] flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2.5 px-4 pt-4 pb-3 justify-between">
          <a className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90 flex-1" href="/dashboard">
            <img
              src="https://cdn.discordapp.com/icons/1532143312600043690/020b2815f6173fbc6b4d07bc8dabc39d.png?size=4096"
              alt="Vira"
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-sm)",
                objectFit: "cover",
              }}
            />
            <span className="min-w-0 overflow-hidden transition-all duration-300 w-auto opacity-100">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">Vira</span>
              <span className="block text-[10px] text-[var(--text-muted)] leading-tight">Selfbot</span>
            </span>
          </a>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1.5 scrollbar-thin">
          {navGroups.map((group) => {
            const isCollapsed = collapsed[group.label];
            return (
              <div key={group.label} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="mb-0.5 flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[10.5px] font-semibold tracking-[0.02em] text-[var(--text-muted)] hover:text-[var(--text-secondary)] justify-between"
                >
                  <span>{group.label}</span>
                  <FaChevronDown
                    style={{
                      fontSize: 9,
                      transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
                    }}
                  />
                </button>
                <div
                  style={{
                    overflow: "hidden",
                    transition: "max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
                    maxHeight: isCollapsed ? 0 : 200,
                    opacity: isCollapsed ? 0 : 1,
                  }}
                >
                    {group.items.map((item) => {
                      const active = pathname === item.path;
                      const Icon = item.Icon;
                      return (
                        <a
                          key={item.path}
                          href={item.path}
                          onClick={(e) => { e.preventDefault(); router.push(item.path); }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "7px 10px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: 13,
                            fontWeight: active ? 500 : 400,
                            color: active ? "var(--text-primary)" : "var(--text-tertiary)",
                            textDecoration: "none",
                            transition: "all var(--transition-fast)",
                            background: active ? "rgba(255,255,255,0.05)" : "transparent",
                            marginBottom: 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                              e.currentTarget.style.color = "var(--text-secondary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!active) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "var(--text-tertiary)";
                            }
                          }}
                        >
                          <Icon style={{ fontSize: 14, flexShrink: 0, opacity: active ? 1 : 0.5 }} />
                          <span className="overflow-hidden whitespace-nowrap">{item.label}</span>
                        </a>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 10px" }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              color: "var(--text-tertiary)",
              width: "100%",
              textAlign: "left",
              background: "transparent",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger-bg)";
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-tertiary)";
            }}
          >
            <FaRightFromBracket style={{ fontSize: 14, flexShrink: 0 }} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
