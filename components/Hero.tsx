"use client";
import Image from "next/image";
import React from "react";

type HeroProps = {
  showTitle?: string;
  showSubtitle?: string;
  /** Dynamic image URL served by /media/... not /public */
  showThumbUrl?: string;
  /** Live stream URL managed in admin settings (e.g., http://.../stream) */
  streamUrl?: string;
};

/**
 * Hero
 * - Static assets come from /public/media (never change at runtime)
 * - Dynamic thumbnail (current show) is provided via props (DB/upload URL), with a safe fallback
 * - Play/Pause/Stop controls manage the HTMLAudioElement + AudioContext (user gesture gated)
 */
export default function Hero({
  showTitle = "The Afrobeat Hour",
  showSubtitle = "Classic Afrobeat and iconic Nigerian music.",
  showThumbUrl = "/now-playing-thumb.jpg", // TODO: replace with /media/rewind-fm/... from DB
  streamUrl = process.env.NEXT_PUBLIC_STREAM_URL || "",
}: HeroProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Resolved stream URL (props/env or fetched from settings)
  const [resolvedStream, setResolvedStream] = React.useState<string>(streamUrl || "");

  // If streamUrl prop/env is empty, fetch from /api/settings once on mount
  React.useEffect(() => {
    let active = true;
    if (!streamUrl) {
      (async () => {
        try {
          const res = await fetch("/api/settings", { cache: "no-store" });
          if (!active) return;
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data?.streamUrl && typeof data.streamUrl === "string") {
              setResolvedStream(data.streamUrl);
              setErrorMsg(null);
            }
          }
        } catch {
          // ignore network errors; we will show a friendly message on play
        }
      })();
    }
    return () => {
      active = false;
    };
  }, [streamUrl]);

  // Build audio lazily on first interaction
  const ensureAudio = React.useCallback(async () => {
    const url = resolvedStream?.trim();
    if (!url) {
      setErrorMsg("No stream configured");
      return null;
    }
    if (!audioRef.current) {
      const el = new Audio(url);
      el.crossOrigin = "anonymous"; // harmless if same-origin, enables analyzer later
      el.preload = "none";
      el.loop = false;
      audioRef.current = el;
    }
    if (!audioCtxRef.current && typeof window !== "undefined") {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        // ignore; playback still works without context
      }
    }
    return audioRef.current;
  }, [resolvedStream]);

  const play = React.useCallback(async () => {
    const el = await ensureAudio();
    if (!el) return;
    try {
      // resume if needed (Chrome auto policy)
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === "suspended") await ctx.resume();

      await el.play();
      setIsPlaying(true);
      setIsPaused(false);
      setErrorMsg(null);
    } catch (e: any) {
      const msg =
        e?.name === "NotAllowedError"
          ? "Tap again to allow audio (browser blocked autoplay)"
          : e?.message ?? "Playback failed";
      setErrorMsg(msg);
    }
  }, [ensureAudio]);

  const pause = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const stop = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {
      // some live streams don't allow seeking; ignore
    }
    setIsPaused(false);
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (el) {
        el.pause();
        audioRef.current = null;
      }
      const ctx = audioCtxRef.current;
      if (ctx) {
        ctx.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  return (
    <section className="text-white lg:h-[80vh] overflow-hidden">
      <div className="grid h-full w-full grid-cols-1 gap-0 md:grid-cols-2">
        {/* LEFT: headline + now playing */}
        <div className="order-2 md:order-1 flex h-full flex-col justify-between bg-[#0A0A0A] px-6 md:px-10 py-8 md:py-0">
          {/* Headline (Neue Power) */}
          <div
            className="flex-1 md:flex md:items-center pb-4 sm:pb-6"
            style={{ fontFamily: "'Neue Power', sans-serif" }}
          >
            <p
              className="font-extrabold leading-[0.92] [text-wrap:balance]"
              style={{ fontSize: "clamp(2.75rem, 6.2vw, 5.75rem)" }}
            >
              Yo! We’re
              <br />
              all about that <span className="text-[#1092A4]">Rewind Vibe.</span>
              <br />
              Let’s jam.
            </p>
          </div>

          {/* Now Playing (Neue Plak light) */}
          <div className="mt-auto w-[calc(100%+3rem)] -ml-6 lg:w-[calc(100%+5rem)] lg:-ml-10 bg-[#F5DCB7] text-black">
            <div
              className="flex items-center gap-4 py-4 sm:gap-5 sm:py-5 px-4 sm:px-5"
              style={{ fontFamily: "'Neue Plak', sans-serif" }}
            >
              {/* thumb (dynamic) */}
              <div className="relative h-16 w-20 overflow-hidden rounded sm:h-20 sm:w-24">
                <Image
                  src={showThumbUrl}
                  alt="Current show artwork"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>

              {/* copy */}
              <div className="min-w-0 flex-1">
                <div className="text-lg font-semibold leading-tight sm:text-xl">
                  {showTitle}
                </div>
                <p className="text-xs leading-snug text-black/70 sm:text-sm">
                  {showSubtitle}
                </p>
                {!resolvedStream ? (
                  <span className="sr-only">No stream configured</span>
                ) : null}
                {errorMsg ? (
                  <p className="mt-1 text-xs text-red-700">{errorMsg}</p>
                ) : null}
              </div>

              {/* transport */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* stop */}
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop"
                  title="Stop"
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#E34C4C] text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 6h12v12H6z" />
                  </svg>
                </button>
                {/* play/pause toggle */}
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={pause}
                    aria-label="Pause"
                    title="Pause"
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#F0C419] text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!resolvedStream) {
                        setErrorMsg("No stream configured");
                        return;
                      }
                      void play();
                    }}
                    aria-label="Play"
                    title={resolvedStream ? "Play" : "No stream configured"}
                    disabled={!resolvedStream}
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#F0C419] text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-black/30"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: static pattern + vinyl + arm with dynamic center label */}
        <div className="order-1 md:order-2 relative h-[60vh] sm:h-[65vh] md:h-full">
          {/* pattern background (static, fills full column height) */}
          <Image
            src="/media/player-background-pattern.svg"
            alt="Turntable background pattern"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* overlays */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Vinyl (static SVG) with spin when playing */}
            <div className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-full w-full rounded-full">
                {/* spinner wrapper to avoid rotating the center label container */}
                <div
                  className={
                    "absolute inset-0 rounded-full " +
                    (isPlaying ? "motion-safe:animate-[spin_14s_linear_infinite]" : "")
                  }
                >
                  <Image
                    src="/media/vinyl-record.svg"
                    alt="Vinyl record"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 70vw, 35vw"
                  />
                </div>

                {/* center label with dynamic thumbnail (does NOT spin) */}
                <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-4 ring-black">
                  <Image
                    src={showThumbUrl}
                    alt="Current show center label"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>
            </div>

            {/* Tonearm (static SVG) — tilt slightly when playing */}
            <div
              className={
                "absolute right-[6%] top-[14%] h-[62%] w-[14%] origin-[10%_15%] transition-transform duration-300 " +
                (isPlaying ? "rotate-[6deg]" : "rotate-0")
              }
            >
              <Image
                src="/media/record-player-arm.svg"
                alt="Record player arm"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 20vw, 10vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}