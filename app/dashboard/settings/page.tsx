"use client";

import { useState } from "react";
import { completeOnboarding } from "@/lib/api";

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Token is required");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const discordId = localStorage.getItem("vira_discord_id") || "";
      await completeOnboarding(discordId, token.trim());
      setSuccess(true);
      setToken("");
    } catch (err: any) {
      setError(err.message || "Failed to update token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-stagger-in space-y-7 pb-10">
      <header className="animate-fade-up">
        <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#52525b]">Preferences</p>
        <h1 className="text-[clamp(1.85rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.04em] text-white">Settings</h1>
        <p className="mt-2 max-w-lg text-[0.95rem] leading-relaxed text-[#8a8a92]">Manage your account token and other preferences.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="dash-v2-panel p-4 sm:p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium tracking-tight text-white/90">Discord Token</h2>
            <p className="text-sm text-[#a1a1aa] mt-1">Update the Discord token used by your selfbot. This will replace your current token.</p>
          </div>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20">
              Token updated successfully! Your bot will restart automatically if connected.
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">New Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter new token..."
                className="w-full rounded-xl border border-white/10 bg-[#121216] p-3 text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="rounded-xl bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Update Token"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
