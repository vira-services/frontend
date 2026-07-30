"use client";

import { useEffect, useState, useCallback } from "react";
import { FaBolt, FaPlus, FaTrashCan, FaRotateRight, FaCircleCheck, FaCircleXmark, FaSpinner } from "react-icons/fa6";
import { getBots, addBot, removeBot, reconnectBot } from "@/lib/api";

interface Bot {
  id: number;
  bot_application_id: string | null;
  connected: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export default function CustomizePage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [adding, setAdding] = useState(false);
  const [reconnecting, setReconnecting] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

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
      await addBot(botToken.trim());
      setSuccess("Bot added and connected successfully!");
      setBotToken("");
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

  return (
    <div className="animate-stagger">
      <div className="page-heading">
        <h1>Customize</h1>
        <p>Manage your Discord bot and slash commands.</p>
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

            {bots.map((bot) => (
              <div key={bot.id} className="card" style={{ padding: "16px 20px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  {bot.connected ? (
                    <FaCircleCheck style={{ fontSize: 16, color: "#2ECC71", flexShrink: 0 }} title="Connected" />
                  ) : (
                    <FaCircleXmark style={{ fontSize: 16, color: "#E74C3C", flexShrink: 0 }} title="Disconnected" />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>
                      {bot.bot_application_id ? `Bot #${bot.bot_application_id}` : `Bot #${bot.id}`}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                      {bot.connected ? "Connected" : "Disconnected"}
                      {bot.updated_at ? ` \u00b7 last updated ${new Date(bot.updated_at).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
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
            ))}

            {bots.length > 0 && !showAddForm && (
              <button className="btn btn-secondary" style={{ marginTop: 4 }} onClick={() => setShowAddForm(true)}>
                <FaPlus style={{ fontSize: 11 }} />
                Add another bot
              </button>
            )}

            {showAddForm && (
              <div className="card" style={{ padding: 24, marginTop: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-primary)" }}>New bot token</p>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2, lineHeight: 1.5 }}>
                    Paste your Discord bot token. The bot must have the <code style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: "var(--radius-sm)", fontSize: 12 }}>applications.commands</code> scope enabled.
                  </p>
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
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={adding || !botToken.trim()} className="btn btn-primary">
                      {adding ? "Connecting..." : "Connect bot"}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowAddForm(false); setBotToken(""); }}>
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
