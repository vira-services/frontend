"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IconSearch,
  IconLock,
  IconBan,
  IconShieldCheck,
  IconUserShield,
  IconGift,
  IconCopy,
  IconTrash,
  IconUserFilled,
  IconLockOpen,
} from "@tabler/icons-react";
import { BADGE_CONFIG } from "@/lib/badges";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface AdminUser {
  id: string;
  uid: number;
  username: string;
  url: string;
  email: string;
  premium: boolean;
  blacklisted: boolean;
  blacklisted_reason: string | null;
  admin: boolean;
  superadmin: boolean;
  owner: boolean;
  createdAt: string;
}

interface AdminGift {
  id: string;
  code: string;
  rewardType: string;
  rewardLabel: string;
  message: string | null;
  status: string;
  createdAt: string;
  claimedAt: string | null;
  claimedUsername: string | null;
}

interface AdminBan {
  id: string;
  username: string;
  reason: string | null;
  createdAt: string;
}

const BADGE_IDS = Object.keys(BADGE_CONFIG);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminClientPage({
  initialUsers,
  initialGifts,
  initialBans,
}: {
  initialUsers: AdminUser[];
  initialGifts: AdminGift[];
  initialBans: AdminBan[];
}) {
  const [tab, setTab] = useState<"users" | "gifts" | "bans">("users");
  const [search, setSearch] = useState("");

  // users
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetting, setResetting] = useState(false);
  const [banUser, setBanUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [usernameBanUser, setUsernameBanUser] = useState<AdminUser | null>(null);
  const [usernameBanReason, setUsernameBanReason] = useState("");
  const [usernameBanning, setUsernameBanning] = useState(false);

  // gifts
  const [gifts, setGifts] = useState<AdminGift[]>(initialGifts);
  const [giftReward, setGiftReward] = useState<"badge" | "premium" | "alias_token">("badge");
  const [giftBadge, setGiftBadge] = useState(BADGE_IDS[0] ?? "premium");
  const [giftMessage, setGiftMessage] = useState("");
  const [creatingGift, setCreatingGift] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // bans
  const [bans, setBans] = useState<AdminBan[]>(initialBans);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.url.toLowerCase().includes(q) ||
        String(u.uid).includes(q),
    );
  }, [users, search]);

  const handleResetPassword = async () => {
    if (!resetUser) return;
    if (resetPw.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUser.id, newPassword: resetPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to reset password");
        return;
      }
      toast.success("Password reset. All sessions were logged out.");
      setResetUser(null);
      setResetPw("");
    } catch {
      toast.error("Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleBanAccount = async () => {
    if (!banUser) return;
    if (!banReason.trim()) {
      toast.error("A ban reason is required");
      return;
    }
    setBanning(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: banUser.id,
          blacklist: true,
          blacklist_reason: banReason.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to ban account");
        return;
      }
      toast.success("Account banned");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === banUser.id
            ? { ...u, blacklisted: true, blacklisted_reason: banReason.trim() }
            : u,
        ),
      );
      setBanUser(null);
      setBanReason("");
    } catch {
      toast.error("Failed to ban account");
    } finally {
      setBanning(false);
    }
  };

  const handleUnbanAccount = async (u: AdminUser) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, blacklist: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to unban");
        return;
      }
      toast.success("Account unbanned");
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, blacklisted: false, blacklisted_reason: null } : x,
        ),
      );
    } catch {
      toast.error("Failed to unban");
    }
  };

  const handleBanUsername = async () => {
    if (!usernameBanUser) return;
    if (!usernameBanReason.trim()) {
      toast.error("A reason is required");
      return;
    }
    setUsernameBanning(true);
    const username = usernameBanUser.username.toLowerCase();
    const reason = usernameBanReason.trim();
    try {
      const res = await fetch("/api/admin/username-bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to ban username");
        return;
      }
      toast.success(`Username "${username}" banned from registration`);
      setBans((prev) => [
        { id: Date.now().toString(), username, reason, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setUsernameBanUser(null);
      setUsernameBanReason("");
    } catch {
      toast.error("Failed to ban username");
    } finally {
      setUsernameBanning(false);
    }
  };

  const handleUnbanUsername = async (b: AdminBan) => {
    try {
      const res = await fetch(`/api/admin/username-bans?id=${b.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to unban username");
        return;
      }
      toast.success(`Username "${b.username}" unbanned`);
      setBans((prev) => prev.filter((x) => x.id !== b.id));
    } catch {
      toast.error("Failed to unban username");
    }
  };

  const handleCreateGift = async () => {
    setCreatingGift(true);
    try {
      const res = await fetch("/api/admin/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardType: giftReward,
          badge: giftReward === "badge" ? giftBadge : undefined,
          message: giftMessage || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to create gift");
        return;
      }
      const g = data.gift;
      const newGift: AdminGift = {
        id: g.id,
        code: g.code,
        rewardType: g.rewardType,
        rewardLabel:
          giftReward === "badge" ? BADGE_CONFIG[giftBadge]?.name ?? giftBadge : giftReward === "premium" ? "Premium" : "Alias Token",
        message: g.message ?? null,
        status: g.status,
        createdAt: new Date().toISOString(),
        claimedAt: null,
        claimedUsername: null,
      };
      setGifts((prev) => [newGift, ...prev]);
      setGiftMessage("");
      toast.success("Gift created! Copy the link below.");
      navigator.clipboard?.writeText(
        `https://gift.vira.wtf/${g.code}`,
      );
    } catch {
      toast.error("Failed to create gift");
    } finally {
      setCreatingGift(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(`https://gift.vira.wtf/${code}`);
    toast.success("Link copied to clipboard");
  };

  const handleRevoke = async (g: AdminGift) => {
    setRevokingId(g.id);
    try {
      const res = await fetch(`/api/admin/gifts/${g.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to revoke gift");
        return;
      }
      toast.success("Gift revoked");
      setGifts((prev) =>
        prev.map((x) => (x.id === g.id ? { ...x, status: "revoked" } : x)),
      );
    } catch {
      toast.error("Failed to revoke gift");
    } finally {
      setRevokingId(null);
    }
  };

  const badgeName = (id: string) => BADGE_CONFIG[id]?.name ?? id;

  return (
    <main className="relative py-8 px-4 md:px-8 w-full">
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-80 w-[44rem] max-w-full rounded-full bg-[#E04CC8]/12 blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E04CC8]/30 bg-[#E04CC8]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E04CC8]">
            <IconUserShield size={12} /> Staff
          </span>
          <h1 className="text-foreground font-bold text-3xl tracking-tight">
            Admin{" "}
            <span className="bg-gradient-to-r from-[#E04CC8] to-[#f49be2] bg-clip-text text-transparent">
              Panel
            </span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage users, signups, and gift rewards.
          </p>
        </div>

        <div className="flex items-center gap-2 border-b border-white/10 pb-0">
          {[
            { key: "users", label: "Users", icon: <IconUserFilled size={15} /> },
            { key: "gifts", label: "Gifts", icon: <IconGift size={15} /> },
            { key: "bans", label: "Username Bans", icon: <IconBan size={15} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                tab === t.key
                  ? "border-[#E04CC8] text-white"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------- USERS TAB ---------- */}
        {tab === "users" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <InputGroup className="py-3 px-1 bg-black/20 border-white/10 max-w-sm">
                <InputGroupAddon>
                  <IconSearch size={16} className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  className="ml-0 !pl-2 text-white bg-transparent"
                  placeholder="Search username, email, url, uid..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
              <span className="text-xs text-muted-foreground">
                {filteredUsers.length} user{filteredUsers.length === 1 ? "" : "s"}
              </span>
            </div>

            <Card className="border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Username</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">UID</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {u.username}
                            </span>
                            {u.owner && (
                              <span className="text-[10px] uppercase bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-md">
                                Owner
                              </span>
                            )}
                            {(u.superadmin || u.admin) && (
                              <span className="text-[10px] uppercase bg-[#E04CC8]/20 text-[#E04CC8] px-1.5 py-0.5 rounded-md">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">#{u.uid}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {u.blacklisted ? (
                            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-1 rounded-md">
                              Banned
                            </span>
                          ) : u.premium ? (
                            <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-1 rounded-md">
                              Premium
                            </span>
                          ) : (
                            <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-md">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer text-muted-foreground hover:text-white"
                              title="Reset password"
                              onClick={() => {
                                setResetUser(u);
                                setResetPw("");
                              }}
                            >
                              <IconLock size={15} />
                            </Button>
                            {u.blacklisted ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer text-muted-foreground hover:text-green-400"
                                title="Unban account"
                                onClick={() => handleUnbanAccount(u)}
                              >
                                <IconLockOpen size={15} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer text-muted-foreground hover:text-red-400"
                                title="Ban account"
                                onClick={() => {
                                  setBanUser(u);
                                  setBanReason("");
                                }}
                                disabled={u.owner || u.superadmin}
                              >
                                <IconBan size={15} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer text-muted-foreground hover:text-red-400"
                              title="Ban username"
                              onClick={() => {
                                setUsernameBanUser(u);
                                setUsernameBanReason("");
                              }}
                            >
                              <IconShieldCheck size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ---------- GIFTS TAB ---------- */}
        {tab === "gifts" && (
          <div className="flex flex-col gap-4">
            <Card className="border border-white/5 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <IconGift size={16} className="text-[#E04CC8]" /> Create Gift
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Create a gift.vira.wtf link that a user can claim once.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-semibold">Reward Type</Label>
                    <div className="flex gap-2">
                      {(["badge", "premium", "alias_token"] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setGiftReward(r)}
                          className={`rounded-lg border px-3 py-2 text-sm capitalize transition-colors cursor-pointer ${
                            giftReward === r
                              ? "border-[#E04CC8] bg-[#E04CC8]/10 text-white"
                              : "border-white/10 text-muted-foreground hover:text-white"
                          }`}
                        >
                          {r.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {giftReward === "badge" && (
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-semibold">Badge</Label>
                      <select
                        value={giftBadge}
                        onChange={(e) => setGiftBadge(e.target.value)}
                        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none cursor-pointer"
                      >
                        {BADGE_IDS.map((id) => (
                          <option key={id} value={id} className="bg-black">
                            {badgeName(id)} ({id})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {giftReward === "alias_token" && (
                    <div className="flex items-end">
                      <p className="text-xs text-muted-foreground">
                        Gives the user an alias token redeemable for a custom alias/url.
                      </p>
                    </div>
                  )}

                  {giftReward === "premium" && (
                    <div className="flex items-end">
                      <p className="text-xs text-muted-foreground">
                        Grants the recipient premium membership.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold">Message (optional)</Label>
                  <InputGroup className="py-3 px-1 bg-black/20 border-white/10">
                    <InputGroupInput
                      className="ml-0 !pl-3 text-white bg-transparent"
                      placeholder="A short note shown to the recipient"
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      maxLength={500}
                    />
                  </InputGroup>
                </div>

                <Button
                  onClick={handleCreateGift}
                  disabled={creatingGift}
                  className="w-fit cursor-pointer bg-[#E04CC8] hover:bg-[#E04CC8]/90"
                >
                  {creatingGift ? (
                    <>
                      <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconGift className="mr-2" /> Create Gift
                    </>
                  )}
                </Button>
              </div>
            </Card>

            <Card className="border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Code</th>
                      <th className="px-4 py-3 font-medium">Reward</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Claimed By</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map((g) => (
                      <tr
                        key={g.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3 font-mono text-white">
                          <button
                            className="hover:text-[#E04CC8] transition-colors cursor-pointer flex items-center gap-1.5"
                            onClick={() => handleCopy(g.code)}
                            title="Copy link"
                          >
                            {g.code}
                            <IconCopy size={13} className="text-muted-foreground" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {g.rewardLabel}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(g.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {g.status === "active" ? (
                            <span className="text-xs bg-green-500/15 text-green-400 px-2 py-1 rounded-md">
                              Active
                            </span>
                          ) : g.status === "claimed" ? (
                            <span className="text-xs bg-[#E04CC8]/15 text-[#E04CC8] px-2 py-1 rounded-md">
                              Claimed
                            </span>
                          ) : (
                            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-1 rounded-md">
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {g.claimedUsername ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {g.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer text-muted-foreground hover:text-red-400"
                                title="Revoke gift"
                                onClick={() => handleRevoke(g)}
                                disabled={revokingId === g.id}
                              >
                                {revokingId === g.id ? (
                                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconTrash size={15} />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {gifts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-muted-foreground"
                        >
                          No gifts created yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ---------- BANS TAB ---------- */}
        {tab === "bans" && (
          <Card className="border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Username</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Banned At</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bans.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {b.username}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {b.reason ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer text-muted-foreground hover:text-green-400"
                            title="Unban username"
                            onClick={() => handleUnbanUsername(b)}
                          >
                            <IconLockOpen size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bans.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-muted-foreground"
                      >
                        No username bans.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ---------- DIALOGS ---------- */}

      <Dialog open={!!resetUser} onOpenChange={(o) => !o && setResetUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset the password for{" "}
              <span className="text-white font-medium">{resetUser?.username}</span>.
              All their sessions will be logged out.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <InputGroup className="py-3.5 px-1 bg-black/20 border-white/10">
              <InputGroupAddon>
                <IconLock size={16} className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white bg-transparent"
                placeholder="New password (min 8 chars)"
                type="text"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
              />
            </InputGroup>
            <Button
              onClick={handleResetPassword}
              disabled={resetting}
              className="cursor-pointer"
            >
              {resetting ? (
                <>
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!banUser} onOpenChange={(o) => !o && setBanUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ban Account</DialogTitle>
            <DialogDescription>
              Suspend{" "}
              <span className="text-white font-medium">{banUser?.username}</span>&rsquo;s
              account. They will no longer be able to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <InputGroup className="py-3.5 px-1 bg-black/20 border-white/10">
              <InputGroupAddon>
                <IconBan size={16} className="text-red-400" />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white bg-transparent"
                placeholder="Ban reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </InputGroup>
            <Button
              onClick={handleBanAccount}
              disabled={banning}
              variant="destructive"
              className="cursor-pointer"
            >
              {banning ? (
                <>
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Banning...
                </>
              ) : (
                "Ban Account"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!usernameBanUser}
        onOpenChange={(o) => !o && setUsernameBanUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ban Username</DialogTitle>
            <DialogDescription>
              Block{" "}
              <span className="text-white font-medium">
                {usernameBanUser?.username}
              </span>{" "}
              from being registered again (even if the account is deleted).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <InputGroup className="py-3.5 px-1 bg-black/20 border-white/10">
              <InputGroupAddon>
                <IconShieldCheck size={16} className="text-red-400" />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white bg-transparent"
                placeholder="Reason"
                value={usernameBanReason}
                onChange={(e) => setUsernameBanReason(e.target.value)}
              />
            </InputGroup>
            <Button
              onClick={handleBanUsername}
              disabled={usernameBanning}
              variant="destructive"
              className="cursor-pointer"
            >
              {usernameBanning ? (
                <>
                  <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  Banning...
                </>
              ) : (
                "Ban Username"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
