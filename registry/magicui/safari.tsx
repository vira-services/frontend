import type { HTMLAttributes, ReactNode } from "react";

const SAFARI_WIDTH = 1203;
const SAFARI_HEIGHT = 753;
const SCREEN_X = 1;
const SCREEN_Y = 52;
const SCREEN_WIDTH = 1200;
const SCREEN_HEIGHT = 700;

const LEFT_PCT = (SCREEN_X / SAFARI_WIDTH) * 100;
const TOP_PCT = (SCREEN_Y / SAFARI_HEIGHT) * 100;
const WIDTH_PCT = (SCREEN_WIDTH / SAFARI_WIDTH) * 100;
const HEIGHT_PCT = (SCREEN_HEIGHT / SAFARI_HEIGHT) * 100;

type SafariMode = "default" | "simple";

export interface SafariProps extends HTMLAttributes<HTMLDivElement> {
  url?: string;
  imageSrc?: string;
  videoSrc?: string;
  mode?: SafariMode;
  children?: ReactNode;
}

export function Safari({
  imageSrc,
  videoSrc,
  url,
  mode = "default",
  className,
  style,
  children,
  ...props
}: SafariProps) {
  const hasVideo = !!videoSrc;
  const hasImage = !!imageSrc;

  return (
    <div
      className={`relative inline-block w-full align-middle leading-none ${className ?? ""}`}
      style={{ aspectRatio: `${SAFARI_WIDTH}/${SAFARI_HEIGHT}`, ...style }}
      {...props}
    >
      {hasVideo && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
          }}
        >
          <video
            className="block size-full object-cover"
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      )}

      {!hasVideo && hasImage && (
        <div
          className="pointer-events-none absolute z-0 overflow-hidden"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: "0 0 11px 11px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            className="block size-full object-cover object-top"
          />
        </div>
      )}

      {!hasVideo && !hasImage && (
        <div
          className="pointer-events-none absolute z-0 flex items-center justify-center overflow-hidden"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: "0 0 11px 11px",
          }}
        >
          {children}
        </div>
      )}

      <svg
        viewBox={`0 0 ${SAFARI_WIDTH} ${SAFARI_HEIGHT}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 z-10 size-full"
        style={{ transform: "translateZ(0)" }}
      >
        <defs>
          <mask id="safariPunch" maskUnits="userSpaceOnUse">
            <rect width={SAFARI_WIDTH} height={SAFARI_HEIGHT} fill="white" />
            <path
              d="M1 52H1201V741C1201 747.075 1196.08 752 1190 752H12C5.92486 752 1 747.075 1 741V52Z"
              fill="black"
            />
          </mask>
          <clipPath id="safariFrame">
            <rect width={SAFARI_WIDTH} height={SAFARI_HEIGHT} rx="12" />
          </clipPath>
        </defs>

        <g
          clipPath="url(#safariFrame)"
          mask={hasVideo || hasImage ? "url(#safariPunch)" : undefined}
        >
          <path
            d="M0 52H1202V741C1202 747.627 1196.63 753 1190 753H12C5.37258 753 0 747.627 0 741V52Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />
          <path
            d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0V12Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />
          <path
            d="M1.067 12C1.067 5.925 5.992 1 12.067 1h1177.866c6.077 0 11.001 4.925 11.001 11v39H1.067V12Z"
            className="fill-white dark:fill-[#262626]"
          />
          <circle cx="27" cy="25" r="6" className="fill-[#FF5F57]" />
          <circle cx="47" cy="25" r="6" className="fill-[#FEBC2E]" />
          <circle cx="67" cy="25" r="6" className="fill-[#28C840]" />

          <path
            d="M286 17C286 13.6863 288.686 11 292 11H946C949.314 11 952 13.6863 952 17V35C952 38.3137 949.314 41 946 41H292C288.686 41 286 38.3137 286 35V17Z"
            className="fill-[#E5E5E5] dark:fill-[#404040]"
          />
          <path
            d="M566.269 32.085h6.157c.851 0 1.27-.419 1.27-1.346v-4.754c0-.838-.343-1.263-1.054-1.333v-1.568c0-2.412-1.606-3.574-3.294-3.574s-3.295 1.162-3.295 3.574v1.587c-.66.102-1.053.521-1.053 1.314v4.754c0 .927.418 1.346 1.269 1.346Zm1.003-9.115c0-1.479.939-2.292 2.076-2.292 1.13 0 2.075.813 2.075 2.292v1.669l-4.151.006V22.97Z"
            fill="#A3A3A3"
          />
          <text
            x="580"
            y="30"
            fill="#A3A3A3"
            fontSize="12"
            fontFamily="Arial, sans-serif"
          >
            {url}
          </text>

          {mode === "default" && (
            <>
              <path
                d="M144 32.6a.9.9 0 0 0 1.5-.66.9.9 0 0 0-.29-.67l-5.47-5.35 5.47-5.33a.92.92 0 0 0 .28-.67.92.92 0 0 0-1.57-.65l-6.08 5.93a1 1 0 0 0-.32.73c0 .27.11.5.32.72L144 32.6Z"
                fill="#A3A3A3"
              />
              <path
                d="M168.42 32.86c.26 0 .47-.1.65-.27l6.08-5.93c.21-.22.32-.45.32-.73 0-.27-.1-.52-.32-.72l-6.08-5.94a.9.9 0 0 0-.65-.27.92.92 0 0 0-.65 1.59l5.48 5.35-5.48 5.33a.92.92 0 0 0 .65 1.59Z"
                fill="#A3A3A3"
              />
              <path
                d="M936.27 24.98c.23 0 .41-.07.55-.22l3.2-3.23a.8.8 0 0 0 0-1.15l-3.2-3.26a.73.73 0 0 0-.55-.23.77.77 0 0 0-.54 1.31l1.87 1.83a7 7 0 1 0 5.88 6.88.78.78 0 0 0-1.55 0 5.44 5.44 0 1 1-5.45-5.44c.5 0 .97.04 1.39.11l-2.14 2.11a.73.73 0 0 0-.21.52c0 .43.34.77.75.77Z"
                fill="#A3A3A3"
              />
              <path
                d="M1099.5 28.41c.4 0 .74-.32.74-.71v-7.86l-.06-1.16.48.57 1.09 1.16a.66.66 0 0 0 .49.22c.36 0 .66-.26.66-.63 0-.2-.08-.34-.21-.47l-2.63-2.52a.75.75 0 0 0-1.11 0l-2.62 2.52a.63.63 0 0 0-.21.47c0 .37.29.63.65.63.18 0 .37-.08.5-.22l1.08-1.16.49-.58-.06 1.17v7.86c0 .39.33.71.73.71Zm-4.5 6.25h9c1.7 0 2.57-.88 2.57-2.55v-7.68c0-1.67-.87-2.55-2.57-2.55h-2.11v1.56h2.01c.71 0 1.12.37 1.12 1.12v7.41c0 .75-.41 1.12-1.12 1.12h-8.8c-.72 0-1.12-.37-1.12-1.12v-7.41c0-.75.4-1.12 1.12-1.12h2.03v-1.56H1095c-1.69 0-2.57.87-2.57 2.55v7.68c0 1.67.88 2.55 2.57 2.55Z"
                fill="#A3A3A3"
              />
              <path
                d="M1134 33.02c.49 0 .89-.41.89-.87v-4.89h4.77c.47 0 .88-.4.88-.89 0-.49-.41-.89-.88-.89h-4.77v-4.89c0-.47-.4-.87-.89-.87-.48 0-.89.4-.89.87v4.89h-4.77c-.46 0-.88.4-.88.89 0 .49.42.89.88.89h4.77v4.89c0 .46.41.87.89.87Z"
                fill="#A3A3A3"
              />
              <path
                d="M1161.8 31.07h1.43v1.3c0 1.68.89 2.55 2.58 2.55h8.39c1.69 0 2.57-.87 2.57-2.54v-8.33c0-1.68-.88-2.55-2.57-2.55h-1.43v-1.24c0-1.67-.89-2.55-2.58-2.55h-8.39c-1.7 0-2.57.87-2.57 2.55v8.26c0 1.68.87 2.55 2.57 2.55Zm4.11 2.3c-.72 0-1.11-.38-1.11-1.13v-8.05c0-.76.39-1.13 1.11-1.13h8.19c.71 0 1.11.37 1.11 1.13v8.05c0 .75-.4 1.13-1.11 1.13h-8.19Z"
                fill="#A3A3A3"
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}