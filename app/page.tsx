"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { CiLogin } from "react-icons/ci";
import { IoSparklesSharp } from "react-icons/io5";

import Ferrofluid from "@/components/ferrofluid";
import { Safari } from "@/registry/magicui/safari";

function LandingNavbar() {
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
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-900 shadow-[0_4px_16px_rgba(255,255,255,0.12)] transition-transform duration-200 hover:scale-[1.03]"
        >
          <CiLogin className="text-lg" aria-hidden="true" />
          Login
        </Link>
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
    <div className="pointer-events-none absolute left-[12vw] top-[48%] z-10 -translate-y-1/2">
      <h1 className="whitespace-nowrap text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
        Selfbot that is{" "}
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
      <p className="mt-3 text-center font-medium text-white/70">
        <span className="font-bold">800</span> users are hosted with{" "}
        <span className="font-semibold text-white">vira</span>
      </p>
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

export default function LandingPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0b0b0e" }}>
      <Ferrofluid />
      <LandingNavbar />
      <HeroHeadline />
      <SafariDemo />
    </div>
  );
}
