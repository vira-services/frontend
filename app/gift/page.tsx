"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { IconGift } from "@tabler/icons-react";
import { FaGift } from "react-icons/fa";
import Background from "@/app/_components/background";

export default function GiftLanding() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    router.push(`/gift/${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <Background />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-5">
        <Image
          src="/logo.png"
          alt="Vira"
          width={48}
          height={48}
          className="rounded-xl"
        />
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[22px] font-bold tracking-tight flex items-center gap-2">
            <FaGift className="text-[#E04CC8]" /> Redeem a Gift
          </h1>
          <p className="text-sm text-white/40">
            Enter your gift code to claim your reward.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4"
        >
          <InputGroup className="py-4 px-1">
            <InputGroupAddon>
              <IconGift size={15} className="text-white/30" />
            </InputGroupAddon>
            <InputGroupInput
              className="!pl-2 text-white text-sm placeholder:text-white/20 uppercase tracking-widest"
              placeholder="GIFT-CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </InputGroup>
          <Button
            type="submit"
            variant="outline"
            className="h-10 text-sm cursor-pointer"
          >
            Redeem
          </Button>
        </form>

        <Link
          href="/"
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
