"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaGift, FaCheck, FaBan } from "react-icons/fa";
import Background from "@/app/_components/background";

export default function GiftClientPage({
  code,
  rewardLabel,
  message,
  status,
  isLoggedIn,
}: {
  code: string;
  rewardLabel: string;
  message: string | null;
  status: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch(`/api/gift/${encodeURIComponent(code)}`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Failed to claim");
        return;
      }
      toast.success(`Claimed ${data.reward ?? "your reward"}!`);
      router.refresh();
    } catch {
      toast.error("Something went wrong, try again");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Background />
      <div className="relative z-10 w-full max-w-sm">
        <Card className="w-full border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#E04CC8]/15 text-[#E04CC8]">
              <FaGift size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">You received a gift!</h1>
            <p className="text-sm text-white/40">
              Redeem your reward below. This gift link can only be claimed once.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest">Reward</p>
              <p className="text-sm font-semibold text-white mt-1">{rewardLabel}</p>
            </div>

            {message && (
              <div className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <p className="text-xs text-white/40 uppercase tracking-widest">Message</p>
                <p className="text-xs text-white/70 mt-1">{message}</p>
              </div>
            )}

            {status === "claimed" ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                <FaCheck /> This gift has already been claimed
              </div>
            ) : status === "revoked" ? (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <FaBan /> This gift is no longer active
              </div>
            ) : !isLoggedIn ? (
              <div className="flex w-full flex-col gap-2">
                <p className="text-xs text-white/40 text-center">
                  Log in to claim this gift.
                </p>
                <Button
                  asChild
                  className="w-full cursor-pointer"
                  size="lg"
                >
                  <Link href={`/auth?next=/gift/${encodeURIComponent(code)}`}>
                    Log in to claim
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full cursor-pointer bg-[#E04CC8] hover:bg-[#E04CC8]/90"
                size="lg"
              >
                {claiming ? (
                  <>
                    <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <FaGift className="mr-2" /> Claim Gift
                  </>
                )}
              </Button>
            )}

            {isLoggedIn && status === "active" && (
              <p className="text-xs text-white/30">
                Signed in. This gift will be added to your account.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
