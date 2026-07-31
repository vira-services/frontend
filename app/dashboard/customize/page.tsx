"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FaBolt, FaPlus, FaTrashCan, FaRotateRight, FaCircleCheck, FaCircleXmark, FaSpinner, FaLink, FaCopy, FaRobot, FaPalette, FaFloppyDisk, FaCamera, FaXmark } from "react-icons/fa6";
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

export default function CustomizePage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [adding, setAdding] = useState(false);
  const [reconnecting, setReconnecting] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [thumbnail, setThumbnail] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

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

  const handleAddBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;
    setAdding(true);
    setError("");
    setSuccess("");
    try {
      const result = await addBot(botToken.trim(), clientId.trim() || undefined);
      setSuccess("Bot connected! " + (result?.invite_url ? "Use the invite link below to add it to a server." : ""));
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

  const handleRemoveBot = async (botId: number) => {
    if (!confirm("Remove this bot?")) return;
    setRemoving(botId);
    setError("");
    setSuccess("");
    try {
      await removeBot(botId);
      setSuccess("Bot removed.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to remove bot");
    } finally {
      setRemoving(null);
    }
  };

  const handleReconnectBot = async (botId: number) => {
    setReconnecting(botId);
    setError("");
    setSuccess("");
    try {
      await reconnectBot(botId);
      setSuccess("Bot reconnected.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to reconnect bot");
    } finally {
      setReconnecting(null);
    }
  };

  const copyInvite = async (bot: Bot) => {
    if (!bot.invite_url) return;
    try {
      await navigator.clipboard.writeText(bot.invite_url);
      setCopiedId(bot.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const toggleEdit = (bot: Bot) => {
    if (editingId === bot.id) {
      setEditingId(null);
    } else {
      setAccent(bot.accent_color || DEFAULT_ACCENT);
      setThumbnail(bot.thumbnail_url || "");
      setEditingId(bot.id);
    }
  };

  const handleSaveAppearance = async (botId: number) => {
    const accentNum = hexToInt(accent);
    if (accent.trim() && accentNum === null) {
      setError("Accent color must be a hex color like #5865F2.");
      return;
    }
    setSavingId(botId);
    setError("");
    setSuccess("");
    try {
      const body: { accent_color: string | null; thumbnail_url: string | null } = {
        accent_color: accent.trim() ? accent.trim().toUpperCase() : null,
        thumbnail_url: thumbnail.trim() || null,
      };
      await updateBot(botId, body);
      setSuccess("Bot appearance saved.");
      await fetchBots();
      const updated = (await getBots()).find((b: Bot) => b.id === botId);
      if (updated) setAccent(updated.accent_color || DEFAULT_ACCENT);
    } catch (err: any) {
      setError(err.message || "Failed to save appearance");
    } finally {
      setSavingId(null);
    }
  };

  const handleAvatarUpload = async (botId: number, file: File | undefined) => {
    if (!file) return;
    setUploadingId(botId);
    setError("");
    setSuccess("");
    try {
      await setBotAvatar(botId, file);
      setSuccess("Bot avatar updated. It may take a moment to reflect in Discord.");
      await fetchBots();
    } catch (err: any) {
      setError(err.message || "Failed to update avatar");
    } finally {
      setUploadingId(null);
      if (fileRefs.current[botId]) fileRefs.current[botId].value = "";
    }
  };

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Customize</h1>
        <p>Manage your Discord bot: slash commands, accent color, thumbnail, and avatar.</p>
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

      <div className="page-section">
        <div className="section-title">
          <FaBolt style={{ fontSize: 11, opacity: 0.6 }} />
          Your bots
        </div>

        {loading ? (
          <div style={{ padding: "24px 0", color: "var(--text-tertiary)", fontSize: 14 }}>Loading bots...</div>
        ) : (
          <>
            {bots.length === 0 && !showAddForm && (
              <div className="card" style={{ padding: 32, textAlign: "center" }}>
                <FaBolt style={{ fontSize: 28, color: "var(--text-muted)", marginBottom: 12, display: "block", marginLeft: "auto", marginRight: "auto" }} />
                <p style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 8 }}>No bots connected yet.</p>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
                  Add a Discord bot token to enable slash commands in your server.
                </p>
                <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                  <FaPlus style={{ fontSize: 11 }} />
                  Add bot
                </button>
              </div>
            )}

            {bots.map((bot) => {
              const expanded = editingId === bot.id;
              const accentHex = bot.accent_color || DEFAULT_ACCENT;
              return (
                <div key={bot.id}>
                  <div className="card card-hover" style={{ padding: "14px 20px", marginBottom: 8, transition: "border-color var(--transition-fast)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                        {bot.avatar_url ? (
                          <img
                            src={bot.avatar_url}
                            alt="Bot avatar"
                            width="40"
                            height="40"
                            style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FaRobot style={{ fontSize: 17, color: "var(--text-muted)" }} />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {bot.client_id || bot.bot_application_id
                                ? `Bot ${bot.client_id ? `#${bot.client_id}` : `#${bot.bot_application_id}`}`
                                : `Bot #${bot.id}`}
                            </p>
                            <span
                              title="Accent color"
                              style={{ width: 12, height: 12, borderRadius: 4, background: accentHex, border: "1px solid var(--border)", flexShrink: 0 }}
                            />
                            {bot.thumbnail_url && (
                              <img
                                src={bot.thumbnail_url}
                                alt="Thumbnail"
                                width="22"
                                height="22"
                                style={{ borderRadius: 4, objectFit: "cover", border: "1px solid var(--border)", flexShrink: 0 }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
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
                            {bot.updated_at ? ` \u00b7 updated ${new Date(bot.updated_at).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button
                          className={`btn ${expanded ? "btn-primary" : "btn-secondary"}`}
                          style={{ height: 30, padding: "0 10px", fontSize: 12 }}
                          onClick={() => toggleEdit(bot)}
                          title="Customize appearance"
                        >
                          <FaPalette style={{ fontSize: 11 }} />
                          {expanded ? "Close" : "Customize"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ height: 30, padding: "0 10px", fontSize: 12 }}
                          onClick={() => handleReconnectBot(bot.id)}
                          disabled={reconnecting === bot.id}
                          title="Reconnect"
                        >
                          {reconnecting === bot.id ? (
                            <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} />
                          ) : (
                            <FaRotateRight style={{ fontSize: 11 }} />
                          )}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ height: 30, padding: "0 10px", fontSize: 12 }}
                          onClick={() => handleRemoveBot(bot.id)}
                          disabled={removing === bot.id}
                          title="Remove"
                        >
                          {removing === bot.id ? (
                            <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} />
                          ) : (
                            <FaTrashCan style={{ fontSize: 11 }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div className="form-group" style={{ flex: 1, minWidth: 0 }}>
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
                          <div className="form-group" style={{ flex: 2, minWidth: 0 }}>
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

                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={savingId === bot.id}
                            onClick={() => handleSaveAppearance(bot.id)}
                          >
                            {savingId === bot.id ? (
                              <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <FaFloppyDisk style={{ fontSize: 11 }} />
                            )}
                            {savingId === bot.id ? "Saving..." : "Save appearance"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={uploadingId === bot.id || !bot.connected}
                            title={bot.connected ? "Upload a new bot avatar" : "Reconnect the bot to change its avatar"}
                            onClick={() => fileRefs.current[bot.id]?.click()}
                          >
                            {uploadingId === bot.id ? (
                              <FaSpinner style={{ fontSize: 11, animation: "spin 1s linear infinite" }} />
                            ) : (
                              <FaCamera style={{ fontSize: 11 }} />
                            )}
                            {uploadingId === bot.id ? "Uploading..." : "Change avatar"}
                          </button>
                          <input
                            ref={(el) => { fileRefs.current[bot.id] = el; }}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleAvatarUpload(bot.id, e.target.files?.[0])}
                          />
                          {!bot.connected && (
                            <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Reconnect the bot to change its avatar.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {bot.invite_url && (
                    <div
                      style={{
                        marginTop: -4,
                        marginBottom: 8,
                        padding: "10px 20px 10px 52px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12.5,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <FaLink style={{ fontSize: 11, flexShrink: 0, color: "var(--accent)" }} />
                      <a
                        href={bot.invite_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "var(--accent)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textDecoration: "none",
                        }}
                      >
                        {bot.invite_url}
                      </a>
                      <button
                        type="button"
                        onClick={() => copyInvite(bot)}
                        title="Copy invite link"
                        style={{
                          background: "none",
                          border: "none",
                          color: copiedId === bot.id ? "#2ECC71" : "var(--text-muted)",
                          cursor: "pointer",
                          padding: 2,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        <FaCopy style={{ fontSize: 12 }} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {bots.length > 0 && !showAddForm && (
              <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => setShowAddForm(true)}>
                <FaPlus style={{ fontSize: 11 }} />
                Add another bot
              </button>
            )}

            {showAddForm && (
              <div className="card" style={{ padding: 24, marginTop: 12 }}>
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
          </>
        )}
      </div>
    </div>
  );
}
