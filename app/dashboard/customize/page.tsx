"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaBolt, FaPlus, FaTrashCan, FaRotateRight, FaSpinner, FaLink, FaCopy, FaRobot, FaPalette, FaFloppyDisk, FaCamera, FaXmark } from "react-icons/fa6";
import { getBots, addBot, removeBot, reconnectBot, updateBot, setBotAvatar } from "@/lib/api";

interface Bot {
  id: number;
  client_id: string | null;
  bot_application_id: string | null;
  connected: boolean;
  accent_color: string | null;
  thumbnail_url: string | null;
  avatar_url: string | null;
  invite_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const DEFAULT_ACCENT = "#5865F2";

function hexToInt(hex: string): number | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || "").trim());
  return m ? parseInt(m[1], 16) : null;
}

const TABS = [
  { key: "general", label: "General", Icon: FaBolt },
  { key: "appearance", label: "Appearance", Icon: FaPalette },
  { key: "avatar", label: "Avatar", Icon: FaCamera },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function CustomizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: TabKey =
    searchParams.get("tab") === "appearance"
      ? "appearance"
      : searchParams.get("tab") === "avatar"
        ? "avatar"
        : "general";

  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [adding, setAdding] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const bot: Bot | null = bots[0] ?? null;

  const fetchBots = useCallback(async () => {
    try {
      const data = await getBots();
      setBots(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load bots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBots(); }, [fetchBots]);

  const setTab = (t: TabKey) => {
    router.push(t === "general" ? "/dashboard/customize" : `/dashboard/customize?tab=${t}`);
  };

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      const result = await addBot(botToken.trim(), clientId.trim() || undefined);
      setSuccess("Bot connected!" + (result?.invite_url ? " Use the invite link below to add it to a server." : ""));
      setBotToken("");
      setClientId("");
      setShowAddForm(false);
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to add bot. Check your token.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveBot = async () => {
    if (!bot || !confirm("Remove this bot?")) return;
    setRemoving(true);
    setError("");
    setSuccess("");
    try {
      await removeBot(bot.id);
      setSuccess("Bot removed.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to remove bot");
    } finally {
      setRemoving(false);
    }
  };

  const handleReconnectBot = async () => {
    if (!bot) return;
    setReconnecting(true);
    setError("");
    setSuccess("");
    try {
      await reconnectBot(bot.id);
      setSuccess("Bot reconnected.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to reconnect bot");
    } finally {
      setReconnecting(false);
    }
  };

  const copyInvite = async () => {
    if (!bot?.invite_url) return;
    try {
      await navigator.clipboard.writeText(bot.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const openAppearance = () => {
    setAccent(bot?.accent_color || DEFAULT_ACCENT);
    setThumbnail(bot?.thumbnail_url || "");
    setTab("appearance");
  };

  const handleSaveAppearance = async () => {
    if (!bot) return;
    const accentNum = hexToInt(accent);
    if (accent.trim() && accentNum === null) {
      setError("Accent color must be a hex color like #5865F2.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateBot(bot.id, {
        accent_color: accent.trim() ? accent.trim().toUpperCase() : null,
        thumbnail_url: thumbnail.trim() || null,
      });
      setSuccess("Bot appearance saved.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to save appearance");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!bot || !file) return;
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      await setBotAvatar(bot.id, file);
      setSuccess("Bot avatar updated. It may take a moment to reflect in Discord.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to update avatar");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const emptyState = (title: string, desc: string) => (
    <div className="card" style={{ padding: 32, textAlign: "center" }}>
      <FaRobot style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} />
      <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>{desc}</p>
      <button className="btn btn-primary" onClick={() => setTab("general")}>
        <FaPlus style={{ fontSize: 11 }} />
        Add bot
      </button>
    </div>
  );

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Customize</h1>
        <p>Set up and customize your bot. One bot per account.</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        {TABS.map((t) => {
          const Icon = t.Icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--accent)" : "var(--text-tertiary)",
                background: active ? "var(--accent-subtle)" : "transparent",
              }}
            >
              <Icon style={{ fontSize: 12 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="message message-error" style={{ marginBottom: 16 }}>
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="message message-success" style={{ marginBottom: 16 }}>
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "24px 0", color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>
      ) : tab === "general" ? (
        <div className="page-section">
          {!bot && !showAddForm && emptyState("No bot connected yet.", "Add a Discord bot token to enable slash commands in your server.")}

          {!bot && showAddForm && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>New bot</p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5 }}>
                    Paste your bot token and client ID. An invite link will be generated automatically so you can add the bot to your server.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setBotToken(""); setClientId(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: 4 }}
                  title="Close"
                >
                  <FaXmark style={{ fontSize: 14 }} />
                </button>
              </div>
              <form onSubmit={handleAddBot} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label className="form-label">Bot token</label>
                  <input
                    type="password"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Paste your bot token..."
                    style={{ width: "100%", maxWidth: 440 }}
                  />
                </div>
                <div>
                  <label className="form-label">Client ID <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional — for invite link)</span></label>
                  <input
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 123456789012345678"
                    style={{ width: "100%", maxWidth: 320 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={adding || !botToken.trim()} className="btn btn-primary">
                    {adding ? "Connecting..." : "Connect bot"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowAddForm(false); setBotToken(""); setClientId(""); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {bot && (
            <div className="page-section">
              <div className="card" style={{ padding: "18px 20px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {bot.avatar_url ? (
                    <img
                      src={bot.avatar_url}
                      alt="Bot avatar"
                      width="44"
                      height="44"
                      style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FaRobot style={{ fontSize: 18, color: "var(--text-muted)" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {bot.client_id || bot.bot_application_id ? `Bot #${bot.client_id || bot.bot_application_id}` : `Bot #${bot.id}`}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {bot.connected ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#2ECC71" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ECC71" }} />
                          Connected
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#E74C3C" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E74C3C" }} />
                          Disconnected
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-secondary" style={{ height: 30, padding: "0 10px", fontSize: 12 }} onClick={handleReconnectBot} disabled={reconnecting} title="Reconnect">
                      {reconnecting ? <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} /> : <FaRotateRight style={{ fontSize: 11 }} />}
                    </button>
                    <button className="btn btn-danger" style={{ height: 30, padding: "0 10px", fontSize: 12 }} onClick={handleRemoveBot} disabled={removing} title="Remove">
                      {removing ? <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} /> : <FaTrashCan style={{ fontSize: 11 }} />}
                    </button>
                  </div>
                </div>

                {bot.invite_url && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-tertiary)" }}>
                    <FaLink style={{ fontSize: 11, flexShrink: 0, color: "var(--accent)" }} />
                    <a
                      href={bot.invite_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: "none" }}
                    >
                      {bot.invite_url}
                    </a>
                    <button
                      type="button"
                      onClick={copyInvite}
                      title="Copy invite link"
                      style={{ background: "none", border: "none", color: copied ? "#2ECC71" : "var(--text-muted)", cursor: "pointer", padding: 2, fontSize: 13, flexShrink: 0 }}
                    >
                      <FaCopy style={{ fontSize: 12 }} />
                    </button>
                  </div>
                )}
              </div>

              <button className="btn btn-secondary" onClick={openAppearance}>
                <FaPalette style={{ fontSize: 11 }} />
                Customize appearance
              </button>
            </div>
          )}
        </div>
      ) : tab === "appearance" ? (
        <div className="page-section">
          {!bot ? (
            emptyState("No bot connected yet.", "Connect a bot first, then customize its accent color and thumbnail.")
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Appearance</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 18, lineHeight: 1.5 }}>
                These apply to the embeds your bot sends (e.g. /help). Accent colors the embed, thumbnail sits top-right.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
                  <label className="form-label">Accent color</label>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <input
                      type="color"
                      value={hexToInt(accent) !== null ? accent : DEFAULT_ACCENT}
                      onChange={(e) => setAccent(e.target.value.toUpperCase())}
                      style={{ width: 40, height: 36, padding: 2, border: "none", cursor: "pointer", borderRadius: "var(--radius-sm)" }}
                    />
                    <input
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      placeholder="#5865F2"
                      style={{ width: 120, fontFamily: "monospace" }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 2, minWidth: 260 }}>
                  <label className="form-label">Thumbnail url (shown in embed previews)</label>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://i.imgur.com/..."
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSaveAppearance}>
                {saving ? <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} /> : <FaFloppyDisk style={{ fontSize: 11 }} />}
                {saving ? "Saving..." : "Save appearance"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="page-section">
          {!bot ? (
            emptyState("No bot connected yet.", "Connect a bot first, then upload a new avatar.")
          ) : (
            <div className="card" style={{ padding: 24 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>Bot avatar</p>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 18, lineHeight: 1.5 }}>
                Upload a new profile picture for your bot. It may take a moment to reflect in Discord.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {bot.avatar_url ? (
                  <img src={bot.avatar_url} alt="Bot avatar" width="64" height="64" style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FaRobot style={{ fontSize: 24, color: "var(--text-muted)" }} />
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={uploading || !bot.connected}
                  title={bot.connected ? "Upload a new bot avatar" : "Reconnect the bot to change its avatar"}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} /> : <FaCamera style={{ fontSize: 11 }} />}
                  {uploading ? "Uploading..." : "Change avatar"}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                />
              </div>
              {!bot.connected && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>Reconnect the bot to change its avatar.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--text-tertiary)", fontSize: 14 }}>Loading...</div>}>
      <CustomizeContent />
    </Suspense>
  );
}
