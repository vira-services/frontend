"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { MdPause } from "react-icons/md";

function formatTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const LYRICS: { time: number; text: string }[] = [
  { time: 3, text: "Mm-mm, ooh" },
  { time: 9, text: "Higher, higher" },
  { time: 14, text: "Saying, higher-er-er-er, ayy" },
  { time: 22, text: "" },
  { time: 24, text: "Tell me why you're crying now, kini, big deal?" },
  { time: 30, text: "When you gave me something I don't really feel" },
  { time: 36, text: "But you knew that already" },
  { time: 40, text: "When I found you on the ground you were dying" },
  { time: 46, text: "Now, you come into my yard uninvited?" },
  { time: 52, text: "Can you see me on the edge? I'm enlightened" },
  { time: 58, text: "If the world was ending" },
  { time: 62, text: "Would you cry or would you try to get me?" },
  { time: 68, text: "Tell me now, I want you to be clear, yeah" },
  { time: 74, text: "Tell me now, I need you to be clear, yeah" },
  { time: 80, text: "" },
  { time: 83, text: "I won't wait for you, for you" },
  { time: 88, text: "I won't wait for you" },
  { time: 92, text: "I won't wait for you" },
  { time: 98, text: "" },
  { time: 101, text: "Get me" },
  { time: 105, text: "Can you put the time on a rewind, yeah?" },
  { time: 112, text: "Help me understand, can you tell me now" },
  { time: 118, text: "Why you made a war that we're fighting now?" },
  { time: 124, text: "And you fall and you run when you see my big guns" },
  { time: 130, text: "Run around, run away as the rebel comes out" },
  { time: 136, text: "Then you call, call on me, when you call me I come" },
  { time: 142, text: "But there you go again (No, you don't)" },
  { time: 148, text: "" },
  { time: 151, text: "With your deaf ears" },
  { time: 155, text: "Open your mind to the sound of the trumpet" },
  { time: 160, text: "What do you want from a life of the hopeless?" },
  { time: 165, text: "Now here you are, and you're begging and crying" },
  { time: 170, text: "" },
  { time: 173, text: "I want to fly, yeah, I'm flying 'til morning" },
  { time: 178, text: "Running away to the land of discovery" },
  { time: 183, text: "Running away from the suffering, I'm gone, yeah" },
  { time: 188, text: "Running away from the darkness, I'm out here, yeah" },
  { time: 195, text: "" },
  { time: 198, text: "Higher than all the limits" },
  { time: 203, text: "Going way beyond the noise and your feelings" },
  { time: 208, text: "When you speak all I can hear is silence" },
  { time: 213, text: "Turning back from all the pain and violence" },
  { time: 218, text: "Big tunes, now it's big tunes I'm killing" },
  { time: 223, text: "Cry now from the side now, call my name" },
  { time: 228, text: "Fall down when you see me, you know that" },
  { time: 233, text: "You know that I won't stay for you" },
  { time: 238, text: "" },
  { time: 241, text: "I won't wait for you, for you" },
  { time: 246, text: "I won't wait for you" },
  { time: 250, text: "I won't wait for you" },
];

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [accent, setAccent] = useState("rgba(180,120,80,0.35)");
  const [accentText, setAccentText] = useState("rgba(180,120,80,1)");
  const [error, setError] = useState(false);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const seeking = useRef(false);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = "/tems.png";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      setAccent(`rgba(${r},${g},${b},0.35)`);
      setAccentText(`rgba(${r},${g},${b},1)`);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (!seeking.current) setProgress(audio.currentTime);
    };
    const onMeta = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onError = () => {
      setError(true);
      setPlaying(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("canplay", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("canplay", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const currentLineIdx = (() => {
    for (let i = LYRICS.length - 1; i >= 0; i--) {
      if (progress >= LYRICS[i].time) return i;
    }
    return 0;
  })();

  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;
    const activeEl = container.querySelector("[data-active]");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentLineIdx]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || error) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const handleScrub = (clientX: number) => {
    const bar = scrubberRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
    setProgress(pct * duration);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    seeking.current = true;
    handleScrub(e.clientX);
    const onMove = (ev: MouseEvent) => handleScrub(ev.clientX);
    const onUp = () => {
      seeking.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10"
      style={{ background: accent }}
    >
      <audio ref={audioRef} src="/tems.mp3" preload="auto" />

      <div className="flex items-center gap-4 p-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/tems.png"
            alt="Tems - Higher"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            className="size-20 object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-white">Higher</p>
          <p className="truncate text-sm text-white/60">Tems</p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              disabled={error}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {playing ? (
                <MdPause className="size-4" />
              ) : (
                <FaPlay className="size-3.5 ml-0.5" />
              )}
            </button>

            <div className="flex flex-1 items-center gap-2">
              <span className="text-[11px] tabular-nums text-white/50">
                {formatTime(progress)}
              </span>
              <div
                ref={scrubberRef}
                onMouseDown={handleMouseDown}
                className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/15"
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${pct}%`, background: accentText }}
                />
                <div
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                  style={{ left: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-white/50">
                {formatTime(duration)}
              </span>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-[11px] text-red-300/80">
              Track not found — add tems.mp3 to /public
            </p>
          )}
        </div>
      </div>

      <div
        ref={lyricsContainerRef}
        className="border-t border-white/10 max-h-44 overflow-y-auto px-5 py-4 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="space-y-2 text-center text-[13px] leading-relaxed">
          {LYRICS.map((line, i) => (
            <p
              key={i}
              data-active={i === currentLineIdx ? "" : undefined}
              className={`transition-all duration-500 ${
                i === currentLineIdx
                  ? "font-semibold text-white"
                  : Math.abs(i - currentLineIdx) <= 2
                    ? "text-white/40"
                    : "text-white/20"
              }`}
            >
              {line.text || "\u00A0"}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}