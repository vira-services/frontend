"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaBorderAll,
  FaDesktop,
  FaRotate,
  FaCircle,
  FaMusic,
  FaRobot,
  FaRightFromBracket,
  FaChevronDown,
  FaUser,
  FaGear,
  FaEllipsisVertical,
} from "react-icons/fa6";
import { logoutUser, getStatus } from "@/lib/api";

interface NavLeaf {
  label: string;
  path: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

interface NavSub {
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  sub: NavLeaf[];
}

type NavItem = NavLeaf | NavSub;

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ label: "Overview", path: "/dashboard", Icon: FaBorderAll }],
  },
  {
    label: "Modules",
    items: [
      {
        label: "Account",
        Icon: FaUser,
        sub: [
          { label: "Device", path: "/dashboard/device", Icon: FaDesktop },
          { label: "Rotator", path: "/dashboard/rotator", Icon: FaRotate },
          { label: "Status", path: "/dashboard/status", Icon: FaCircle },
          { label: "Rich presence", path: "/dashboard/rpc", Icon: FaMusic },
        ],
      },
      { label: "Customize", path: "/dashboard/customize", Icon: FaRobot },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [subCollapsed, setSubCollapsed] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    setUsername(localStorage.getItem("vira_username") || "User");
    getStatus()
      .then((s) => {
        if (s?.username) setUsername(s.username);
        if (s?.avatar_url) setAvatar(s.avatar_url);
      })
      .catch(() => {});
  }, []);

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleSub = (label: string) => {
    setSubCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {}
    localStorage.removeItem("vira_jwt");
    router.push("/login");
  };

  const renderLeaf = (item: NavLeaf, indent: boolean) => {
    const active = pathname === item.path;
    const Icon = item.Icon;
    return (
      <a
        key={item.path}
        href={item.path}
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen(false);
          router.push(item.path);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 10px",
          paddingLeft: indent ? 26 : 10,
          borderRadius: "var(--radius-sm)",
          fontSize: 13,
          fontWeight: active ? 500 : 400,
          color: active ? "var(--text-primary)" : "var(--text-tertiary)",
          textDecoration: "none",
          background: active ? "var(--bg-elevated)" : "transparent",
          transition: "all var(--transition-fast)",
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
  };

  const renderSub = (item: NavSub) => {
    const Icon = item.Icon;
    const isCollapsed = subCollapsed[item.label];
    const active = item.sub.some((s) => pathname === s.path);
    return (
      <div key={item.label}>
        <button
          type="button"
          onClick={() => toggleSub(item.label)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "7px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: 13,
            fontWeight: active ? 500 : 400,
            color: active ? "var(--text-secondary)" : "var(--text-tertiary)",
            background: "transparent",
            textAlign: "left",
            transition: "all var(--transition-fast)",
            marginBottom: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = active ? "var(--text-secondary)" : "var(--text-tertiary)";
          }}
        >
          <Icon style={{ fontSize: 14, flexShrink: 0, opacity: active ? 0.8 : 0.5 }} />
          <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
          <FaChevronDown
            style={{
              fontSize: 9,
              color: "var(--text-tertiary)",
              transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
            }}
          />
        </button>
        <div
          style={{
            overflow: "hidden",
            transition: "max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
            maxHeight: isCollapsed ? 0 : 220,
            opacity: isCollapsed ? 0 : 1,
          }}
        >
          {item.sub.map((leaf) => renderLeaf(leaf, true))}
        </div>
      </div>
    );
  };

  return (
    <aside
      className="pointer-events-auto fixed inset-y-0 left-0 z-40 hidden flex-col overflow-visible transition-all duration-300 md:flex"
      style={{
        width: "var(--sidebar-w)",
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="relative z-[1] flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-4">
          <a className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90" href="/dashboard">
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
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">Vira</span>
              <span className="block text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>Selfbot</span>
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
                    maxHeight: isCollapsed ? 0 : 320,
                    opacity: isCollapsed ? 0 : 1,
                  }}
                >
                  {group.items.map((item) => ("sub" in item ? renderSub(item) : renderLeaf(item, false)))}
                </div>
              </div>
            );
          })}
        </nav>

        <div
          style={{
            position: "relative",
            borderTop: "1px solid var(--border)",
            padding: "10px 12px",
          }}
        >
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[45]" onClick={() => setMenuOpen(false)} />
              <div
                className="animate-scale-in"
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: 12,
                  right: 12,
                  zIndex: 46,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-tertiary)",
                  boxShadow: "var(--shadow-popover)",
                  padding: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    background: "transparent",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FaGear style={{ fontSize: 13 }} />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "var(--danger)",
                    background: "transparent",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FaRightFromBracket style={{ fontSize: 13 }} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {avatar ? (
              <img
                src={avatar}
                alt=""
                width="32"
                height="32"
                style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {username[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {username}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              title="Settings"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 8,
                color: menuOpen ? "var(--accent)" : "var(--text-tertiary)",
                background: menuOpen ? "var(--accent-subtle)" : "transparent",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                if (!menuOpen) {
                  e.currentTarget.style.color = "var(--text-tertiary)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <FaEllipsisVertical style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
