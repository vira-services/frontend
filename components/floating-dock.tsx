"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBadgeFilled,
  IconDeviceDesktop,
  IconLayoutGridFilled,
  IconLink,
  IconLogout,
  IconSettings,
  IconUserFilled,
  IconUserShield,
} from "@tabler/icons-react";
import { PiPaintBrushFill } from "react-icons/pi";
import { useUser } from "@/app/dashboard/_user-provider";
import { cn } from "@/lib/utils";

interface NavLink {
  icon: React.ReactNode;
  name: string;
  url: string;
}

const navLinks: NavLink[] = [
  {
    icon: <IconDeviceDesktop size={18} />,
    name: "Overview",
    url: "/dashboard",
  },
  {
    icon: <IconUserFilled size={18} />,
    name: "Profile",
    url: "/dashboard/profile",
  },
  {
    icon: <PiPaintBrushFill size={18} />,
    name: "Appearance",
    url: "/dashboard/profile?tab=appearance",
  },
  {
    icon: <IconLink size={18} />,
    name: "Links",
    url: "/dashboard/profile?tab=links",
  },
  {
    icon: <IconLayoutGridFilled size={18} />,
    name: "Widgets",
    url: "/dashboard/profile?tab=widgets",
  },
  {
    icon: <IconBadgeFilled size={18} />,
    name: "Badges",
    url: "/dashboard/profile?tab=badges",
  },
];

const adminLink: NavLink = {
  icon: <IconUserShield size={18} />,
  name: "Admin",
  url: "/dashboard/admin",
};

function isActive(item: NavLink, pathname: string, searchParams: URLSearchParams) {
  const [urlPath, urlQuery] = item.url.split("?");
  const pathMatches = pathname === urlPath;
  const queryMatches = urlQuery
    ? Array.from(new URLSearchParams(urlQuery).entries()).every(
        ([k, v]) => searchParams.get(k) === v,
      )
    : !searchParams.toString();
  return pathMatches && queryMatches;
}

function DockItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = isActive(item, pathname, searchParams);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.url}
          aria-label={item.name}
          data-active={active}
          className={cn(
            "flex size-11 items-center justify-center rounded-full text-white/60 transition-all duration-200 hover:scale-110 hover:text-white",
            active &&
              "bg-[#E04CC8] text-white shadow-[0_0_16px_rgba(224,76,200,0.55)]",
          )}
        >
          {item.icon}
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="text-xs">{item.name}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export function FloatingDock() {
  const router = useRouter();
  const { user } = useUser();

  const isAdmin = !!user && (user.admin || user.superadmin || user.owner);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  };

  return (
    <TooltipProvider delayDuration={100}>
      <nav
        aria-label="Main navigation"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
          {navLinks.map((item) => (
            <DockItem key={item.name} item={item} />
          ))}

          {isAdmin && <DockItem item={adminLink} />}

          <div className="mx-1 h-6 w-px bg-white/15" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account"
                className="group flex size-11 items-center justify-center rounded-full text-white/60 transition-transform duration-200 hover:scale-110"
              >
                <div className="relative size-8 overflow-hidden rounded-full ring-1 ring-white/20">
                  <Image
                    src={
                      user?.config?.avatar_url ??
                      "https://cdn.discordapp.com/embed/avatars/0.png"
                    }
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mb-2">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="relative size-8 overflow-hidden rounded-full">
                  <Image
                    src={
                      user?.config?.avatar_url ??
                      "https://cdn.discordapp.com/embed/avatars/0.png"
                    }
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid leading-tight">
                  <span className="text-sm font-semibold">{user?.username}</span>
                  <span className="text-xs text-muted-foreground">vira.wtf</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <IconSettings />
                Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </TooltipProvider>
  );
}
