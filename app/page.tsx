"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { CiLogin } from "react-icons/ci";
import { IoSparklesSharp } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa6";
import { FaHandshakeAltSlash } from "react-icons/fa";
import { GiReceiveMoney } from "react-icons/gi";
import { IoDiamondOutline } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";
import { SiDiscord } from "react-icons/si";

import Ferrofluid from "@/components/ferrofluid";
import MusicPlayer from "@/components/music-player";
import LanyardPresence from "@/components/lanyard";
import { Safari } from "@/registry/magicui/safari";
import { getOnboardingStatus, getStatus } from "@/lib/api";

type AuthState =
  | { kind: "loading" }
  | { kind: "login" }
  | { kind: "profile"; username: string; avatar: string | null };

function LandingNavbar() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        const token = localStorage.getItem("vira_jwt");
        if (!token) {
          if (!cancelled) setAuth({ kind: "login" });
          return;
        }
        const os = await getOnboardingStatus().catch(() => null);
        if (os?.has_token && os.token_valid === false) {
          if (!cancelled) setAuth({ kind: "login" });
          return;
        }
        const st = await getStatus().catch(() => null);
        if (cancelled) return;
        setAuth({
          kind: "profile",
          username: st?.username || localStorage.getItem("vira_username") || "User",
          avatar: st?.avatar_url || null,
        });
      } catch {
        if (!cancelled) setAuth({ kind: "login" });
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className="absolute left-1/2 top-4 z-20 flex h-14 w-[calc(100%-4rem)] max-w-4xl -translate-x-1/2 items-center justify-between rounded-2xl border border-white/[0.07] bg-black/20 px-4 shadow-[0_12px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-5"
    >
      <Link href="/" aria-label="Vira home" className="rounded-lg transition-opacity hover:opacity-80">
        <Image src="/logo.png" alt="Vira" width={30} height={30} className="size-[30px] rounded-lg object-cover" priority />
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="#features"
          className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-white/70 transition-colors hover:text-white"
        >
          <IoSparklesSharp className="text-sm" aria-hidden="true" />
          Features
        </Link>
        <Link
          href="#pricing"
          className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-white/70 transition-colors hover:text-white"
        >
          <GiReceiveMoney className="text-sm" aria-hidden="true" />
          Pricing
        </Link>

        {auth.kind === "loading" && (
          <span className="inline-flex h-8 w-[110px] items-center justify-center rounded-full border border-white/10 bg-white/5">
            <FaSpinner className="size-3.5 animate-spin text-white/50" aria-hidden="true" />
          </span>
        )}

        {auth.kind === "login" && (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-900 shadow-[0_4px_16px_rgba(255,255,255,0.12)] transition-transform duration-200 hover:scale-[1.03]"
          >
            <CiLogin className="text-lg" aria-hidden="true" />
            Login
          </Link>
        )}

        {auth.kind === "profile" && (
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            title="Open dashboard"
            className="inline-flex max-w-[180px] items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-[1.03] hover:border-white/30"
          >
            {auth.avatar ? (
              <img
                src={auth.avatar}
                alt=""
                width={24}
                height={24}
                className="size-6 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-[#E04CC8] text-[11px] font-bold text-white">
                {auth.username[0]?.toUpperCase() || "?"}
              </span>
            )}
            <span className="max-w-[110px] truncate">{auth.username}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

const ROTATING_WORDS = ["free", "safe", "fast"];

function HeroHeadline() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const rotationTimer = setInterval(() => {
      setWordIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2000);

    return () => clearInterval(rotationTimer);
  }, []);

  return (
    <div className="pointer-events-none absolute left-[12vw] top-[48%] z-10 w-[40vw] -translate-y-1/2 text-center">
      <h1 className="whitespace-nowrap text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
        biolink that is{" "}
        <span className="inline-grid text-center">
          {ROTATING_WORDS.map((word, index) => (
            <span
              key={word}
              style={{ gridArea: "1 / 1" }}
              className={`text-center text-[#E04CC8] transition-opacity duration-300 ease-out ${
                index === wordIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {word}
            </span>
          ))}
        </span>,{" "}
        and in your reach
      </h1>
      <p className="mt-2 text-center text-xl font-medium italic tracking-wide text-white sm:text-2xl">meet vira.</p>
      <div className="mt-3 h-px w-full bg-gradient-to-r from-[#E04CC8]/80 via-white/40 to-transparent" />
      <div className="pointer-events-auto mt-4 flex items-center justify-center gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900 transition-transform duration-200 hover:scale-[1.03]"
        >
          <FaHandshakeAltSlash className="text-base" aria-hidden="true" />
          Join Now
        </Link>
        <a
          href="https://discord.gg/N6cFVRFqJy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] hover:border-white/30"
        >
          <SiDiscord className="text-base" aria-hidden="true" />
          Join Discord
        </a>
      </div>
    </div>
  );
}

export function SafariDemo() {
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  const animateTilt = () => {
    const current = currentTilt.current;
    const target = targetTilt.current;
    const deltaX = target.x - current.x;
    const deltaY = target.y - current.y;

    current.x += deltaX * 0.1;
    current.y += deltaY * 0.1;

    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateZ(2deg) rotateX(${current.x}deg) rotateY(${current.y}deg)`;
    }

    if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
      frameRef.current = requestAnimationFrame(animateTilt);
    } else {
      frameRef.current = null;
    }
  };

  const startAnimation = () => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(animateTilt);
    }
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const cursorX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const cursorY = (event.clientY - bounds.top) / bounds.height - 0.5;
    targetTilt.current = { x: cursorY * 24, y: cursorX * -24 };
    startAnimation();
  };

  const handleMouseLeave = () => {
    targetTilt.current = { x: 0, y: 0 };
    startAnimation();
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute right-[-3vw] top-1/2 z-10 w-[52vw] -translate-x-[14px] -translate-y-1/2 sm:right-0 sm:w-[44vw] lg:right-[3vw] lg:w-[min(38vw,650px)]">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: "perspective(1000px) rotateZ(2deg)",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <Safari url="vira.wtf" imageSrc="/das.png" />
      </div>
    </div>
  );
}

function FadeInSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "400px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [bgOpacity, setBgOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY;
      const fade = 1 - Math.min(1, Math.max(0, (scrollY - vh * 0.3) / (vh * 0.5)));
      setBgOpacity(fade);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#0b0b0e" }}>
      <div style={{ position: "fixed", inset: 0, opacity: bgOpacity, transition: "opacity 0.3s ease-out", pointerEvents: "none" }}>
        <Ferrofluid />
      </div>
      <LandingNavbar />
      <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <HeroHeadline />
        <SafariDemo />
      </section>
      <FadeInSection
        id="features"
        className="flex min-h-[30vh] flex-col items-center justify-center px-6 pt-10"
      >
        <h2 className="max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your digital footprint, brought onto one platform
        </h2>
        <p className="mt-5 max-w-2xl text-center text-base font-medium leading-relaxed text-white/60 sm:text-lg">
          Vira — the biolink app that pulls your entire digital footprint — social profiles, portfolio, shop, music, videos, contact info, and more — into a single, customizable page. Instead of scattering your presence across a dozen platforms, share one Vira link and let people find every part of you in one place.
        </p>
        <div className="mt-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-stretch sm:justify-center">
          <MusicPlayer />
          <LanyardPresence />
        </div>
      </FadeInSection>
      <FadeInSection className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-20">
        <h2 className="max-w-3xl text-center text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          One Family, One Platform
        </h2>
        <p className="mt-5 text-center text-base font-medium text-white/50 sm:text-lg">
          <span className="font-bold text-white/70">placeholder</span> Profile Creations &nbsp;&bull;&nbsp; <span className="font-bold text-white/70">placeholder</span> Profile Visits
        </p>
        <div className="relative mt-10 w-full max-w-4xl">
          <div className="grid grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"
                style={i >= 30 ? { opacity: 1 - (i - 30) * 0.15 } : undefined}
              >
                <img
                  src="/logo.png"
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <span className="truncate text-[11px] text-white/50">@placeholder</span>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#0b0b0e] to-transparent" />
        </div>
      </FadeInSection>
      <FadeInSection id="pricing" className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-20">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Image Host</h2>
        <p className="mt-4 max-w-2xl text-center text-base font-medium leading-relaxed text-white/50 sm:text-lg">
          Introducing, Vira&apos;s Image Host, all-in-one biolink - image host at the tip of your keyboard
        </p>
        <div className="mt-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <IoDiamondOutline className="size-8 text-[#E04CC8]" aria-hidden="true" />
            <div>
              <p className="text-lg font-bold text-white">Premium Image Host</p>
              <p className="text-sm font-semibold text-[#E04CC8]">$3.00/Lifetime</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <IoMdCheckmark className="mt-0.5 size-4 shrink-0 text-[#E04CC8]" />
              <p className="text-sm text-white/60">
                Access to all of your favorite tools, such as ShareX and more
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <IoMdCheckmark className="mt-0.5 size-4 shrink-0 text-[#E04CC8]" />
              <p className="text-sm text-white/60">
                All in one app, meaning you don&apos;t need more than one website to store your favorite images
              </p>
            </div>
          </div>
          <a
            href="https://discord.gg/N6cFVRFqJy"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#E04CC8] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(224,76,200,0.3)] transition-transform hover:scale-[1.03]"
          >
            Upgrade Today
          </a>
        </div>
      </FadeInSection>
      <FadeInSection className="flex min-h-[40vh] flex-col items-center justify-center px-6 pt-10">
        <h2 className="max-w-4xl text-center text-3xl font-bold leading-tight tracking-tight text-nowrap text-white sm:text-4xl lg:text-5xl">
          Join Vira Today, to Form a Family
        </h2>
        <div className="pointer-events-auto mt-6 flex items-center gap-4">
          <div className="flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3">
            <span className="text-sm font-medium text-white/60">vira.wtf/</span>
            <input
              type="text"
              placeholder="username"
              className="w-28 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/30"
            />
          </div>
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Claim Now
          </button>
        </div>
      </FadeInSection>
      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Vira" width={28} height={28} className="size-7 rounded-lg object-cover" />
            <span className="text-lg font-bold text-white">Vira</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
            <a href="https://discord.gg/N6cFVRFqJy" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
              Discord
            </a>
            <a href="/login" className="transition-colors hover:text-white">
              Login
            </a>
            <a href="/signup" className="transition-colors hover:text-white">
              Sign Up
            </a>
            <a href="/dashboard" className="transition-colors hover:text-white">
              Dashboard
            </a>
          </div>
          <div className="h-px w-full max-w-xs bg-white/10" />
          <p className="text-xs text-white/25">&copy; {new Date().getFullYear()} Vira. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
