"use client";

import { useEffect, useRef, useState } from "react";

const USER_IDS = ["1470150000108634152", "398446067508707349"];

const FAKE_OVERRIDE: Record<
  string,
  {
    displayName: string;
    activityImage: string;
    activityLabel: string;
    activityName: string;
    activityDetail?: string;
  }
> = {
  "1470150000108634152": {
    displayName: "@misobeyed",
    activityImage: "/vsc.png",
    activityLabel: "Playing",
    activityName: "Visual Studio Code",
    activityDetail: "Editing a project",
  },
  "398446067508707349": {
    displayName: "@onlyaaryn",
    activityImage: "/twitch.png",
    activityLabel: "Watching",
    activityName: "Kai Cenat",
  },
};

interface LanyardData {
  username: string;
  global_name?: string;
  avatar: string;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: {
    name: string;
    type: number;
    state?: string;
    details?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    timestamps?: { start?: number };
  }[];
}

function ActivityIcon({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-[11px] font-bold text-white/40">
        {alt?.[0]?.toUpperCase() || "?"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="size-9 shrink-0 rounded-md bg-white/10 object-cover"
    />
  );
}

function PresenceCard({ userId }: { userId: string }) {
  const [data, setData] = useState<LanyardData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(() => {});

    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 2,
          d: { subscribe_keys: [`user:${userId}`] },
        }),
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 0 && msg.t === "INIT_STATE") {
        const user = msg.d[userId];
        if (user) setData(user);
      }
      if (
        msg.op === 0 &&
        msg.t === "PRESENCE_UPDATE" &&
        msg.d?.user_id === userId
      ) {
        setData(msg.d);
      }
    };

    return () => ws.close();
  }, [userId]);

  const fake = FAKE_OVERRIDE[userId];

  if (!data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="size-12 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-3.5 w-28 animate-pulse rounded bg-white/10" />
            <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-full animate-pulse rounded bg-white/10" />
          <div className="h-2.5 w-3/4 animate-pulse rounded bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.lanyard.rest/${userId}.png`}
            alt={data.username}
            className="size-12 rounded-full object-cover"
          />
          <span
            className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-[#0b0b0e]"
            style={{ background: "#23a55a" }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            {fake?.displayName || data.global_name || data.username}
          </p>
          <p className="text-xs text-white/40">{data.username}</p>
        </div>
      </div>

      {fake && (
        <div className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3">
          <ActivityIcon src={fake.activityImage} alt={fake.activityName} />
          <div className="min-w-0">
            <p className="text-[11px] text-white/30">{fake.activityLabel}</p>
            <p className="truncate text-xs font-medium text-white">
              {fake.activityName}
            </p>
            {fake.activityDetail && (
              <p className="truncate text-[11px] text-white/40">
                {fake.activityDetail}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LanyardPresence() {
  return (
    <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2">
      {USER_IDS.map((id) => (
        <PresenceCard key={id} userId={id} />
      ))}
    </div>
  );
}