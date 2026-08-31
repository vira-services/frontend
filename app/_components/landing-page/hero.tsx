"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBrandX,
  IconLink,
  IconMusic,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [username, setUsername] = useState("");

  return (
    <section
      className="relative flex min-h-screen w-full flex-col items-center justify-center md:pt-24 overflow-hidden"
      style={{ background: "#0b0b0e" }}
    >
      {/* purple ambient glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#8B5CF6]/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-[#6366F1]/15 blur-[120px]" />
        <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-[#A855F7]/10 blur-[100px]" />
      </div>

      <section className="flex flex-col items-center text-center max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur"
        >
          <IconSparkles className="text-[#A78BFA]" size={16} />
          One-letter links are live on vira.wtf
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] text-white leading-[1.05]"
        >
          Everything about you,
          <span className="block bg-gradient-to-r from-[#A78BFA] via-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">
            on one clean link.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 max-w-xl text-base sm:text-lg text-white/60"
        >
          Gather your bio, music, socials and badges into a single beautiful
          profile — then share juts one link.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex items-center gap-2 py-4 w-full max-w-md"
        >
          <InputGroup className="flex-1 py-4.5 px-1">
            <InputGroupInput
              pattern="^\S+$"
              className="ml-0 !pl-0 text-white placeholder:text-white/40"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData
                  .getData("text")
                  .replace(/\s/g, "");
                document.execCommand("insertText", false, pasted);
              }}
            />
            <InputGroupAddon>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                vira.wtf/
              </motion.span>
            </InputGroupAddon>
          </InputGroup>
          <Button
            asChild
            className="shrink-0 gap-1.5 rounded-full px-5 py-4.5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03]"
          >
            <Link
              href={`/auth?mode=register&url=${encodeURIComponent(username)}`}
            >
              Get Started <IconArrowRight size={15} />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/50"
        >
          <span className="inline-flex items-center gap-1.5">
            <IconBrandX size={14} /> Share on any network
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="inline-flex items-center gap-1.5">
            <IconMusic size={14} /> Add your music
          </span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="inline-flex items-center gap-1.5">
            <IconLink size={14} /> Claim a 1-letter alias
          </span>
        </motion.div>
      </section>

      {/* dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="relative mt-14 w-full max-w-5xl px-4"
      >
        <div className="pointer-events-none absolute inset-x-8 top-8 -z-10 h-2/3 rounded-full bg-[#8B5CF6]/25 blur-[100px]" />
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-2">
          <Image
            src="/dashboard.png"
            alt="Vira dashboard preview"
            width={1920}
            height={1203}
            priority
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      </motion.div>
    </section>
  );
}
