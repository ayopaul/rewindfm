"use client";

import * as React from "react";
import Image from "next/image";

/**
 * Single, shared HTMLAudioElement for the whole app.
 * We store it on window to survive client navigations and ensure persistence.
 */
function getGlobalAudio(): HTMLAudioElement {
  if (typeof window === "undefined") return new Audio();
  const w = window as any;
  if (!w.__rewindAudio) {
    const a = new Audio();
    a.preload = "none";
    a.crossOrigin = "anonymous";
    a.volume = 1.0;
    w.__rewindAudio = a;
  }
  return w.__rewindAudio as HTMLAudioElement;
}

// Payload shape for updating the dock from anywhere (e.g., Hero section)
export type NowPlayingPayload = {
  title?: string;
  subtitle?: string;
  image?: string; // URL (public/media or uploaded proxy route)
  streamUrl?: string; // live stream url
};

// Simple event bus so other components can update the dock without tight coupling
const UPDATE_EVENT = "rewind:updateNowPlaying";
export function setNowPlaying(payload: NowPlayingPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: payload }));
}

// Default visuals in case nothing has been pushed yet
const DEFAULT_META: Required<NowPlayingPayload> = {
  title: "The Afrobeat Hour",
  subtitle: "Classic Afrobeat and iconic Nigerian music.",
  image: "/media/placeholder/vinyl-thumb.jpg",
  streamUrl: process.env.NEXT_PUBLIC_STREAM_URL || "",
};

export default function PlayerDock() {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [meta, setMeta] = React.useState(DEFAULT_META);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // attach global audio once
  React.useEffect(() => {
    const el = getGlobalAudio();
    audioRef.current = el;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    // Listen for metadata updates from anywhere
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<NowPlayingPayload>).detail || {};
      setMeta((prev) => ({
        title: detail.title ?? prev.title,
        subtitle: detail.subtitle ?? prev.subtitle,
        image: detail.image ?? prev.image,
        streamUrl: detail.streamUrl ?? prev.streamUrl,
      }));
      // if we update stream url while playing, switch source seamlessly
      if (detail.streamUrl && el.src !== detail.streamUrl) {
        const wasPlaying = !el.paused;
        el.src = detail.streamUrl;
        if (wasPlaying) void el.play().catch(() => {});
      }
    };
    window.addEventListener(UPDATE_EVENT, onUpdate);

    // initialize src
    if (!el.src && meta.streamUrl) el.src = meta.streamUrl;

    (async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        const url = String(data?.streamUrl || "");
        // If nothing set yet, prime from API
        if (url) {
          if (!el.src) el.src = url;
          setMeta((prev) => (prev.streamUrl ? prev : { ...prev, streamUrl: url }));
          setError(null);
        } else if (!meta.streamUrl) {
          setError("No stream configured");
        }
      } catch {
        if (!meta.streamUrl) setError("Unable to load stream settings");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      window.removeEventListener(UPDATE_EVENT, onUpdate);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    try {
      // Ensure we have a source before trying to play
      const src = el.src || meta.streamUrl;
      if (!src) {
        setError("No stream configured");
        return;
      }
      if (!el.src) el.src = src;

      if (el.paused) {
        await el.play();
        setError(null);
      } else {
        el.pause();
      }
    } catch (err: any) {
      console.error("Audio play error", err);
      setError(
        err?.name === "NotAllowedError"
          ? "Playback blocked by the browser"
          : "Could not start playback"
      );
    }
  };

  const stopPlayback = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    setError(null);
    // reset to start without unloading source
    try {
      el.currentTime = 0;
    } catch {}
  };

  // Hide dock if we have absolutely no stream configured (still render layout if you want)
  // if (!meta.streamUrl) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/20 bg-[#FFFEF1]"
      role="region"
      aria-label="Persistent player"
    >
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* left: artwork + titles */}
          <div className="flex items-center gap-4 min-w-0">
            {/* artwork */}
            <div className="relative h-11 w-11 md:h-14 md:w-14 overflow-hidden border border-black/20 bg-black/10">
              {/* Using next/image to benefit from optimization; falls back gracefully */}
              <Image
                src={meta.image}
                alt={meta.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div
                className="truncate"
                style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 800 }}
              >
                {meta.title}
              </div>
              <div className="text-sm text-black/70 truncate" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
                {meta.subtitle}
              </div>
            </div>
          </div>

          {/* right: controls */}
          <div className="flex items-center gap-4">
            {/* stop */}
            <button
              type="button"
              onClick={stopPlayback}
              aria-label="Stop"
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.75)]"
              style={{ backgroundColor: "#F26B57" }}
            >
              <span className="absolute inset-0 grid place-items-center">
                <span className="block h-3.5 w-3.5 md:h-4 md:w-4 bg-white" />
              </span>
            </button>

            {/* play/pause */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              title={error ?? (isPlaying ? "Pause" : "Play")}
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-black shadow-[4px_4px_0_0_rgba(0,0,0,0.75)]"
              style={{ backgroundColor: "#FFD34D" }}
            >
              <span className="absolute inset-0 grid place-items-center">
                {isPlaying ? (
                  // pause icon
                  <span className="flex items-center gap-1">
                    <span className="block h-4 w-1.5 md:h-5 md:w-2 bg-black" />
                    <span className="block h-4 w-1.5 md:h-5 md:w-2 bg-black" />
                  </span>
                ) : (
                  // play icon
                  <span
                    className="block"
                    style={{
                      width: "0",
                      height: "0",
                      borderTop: "10px solid transparent",
                      borderBottom: "10px solid transparent",
                      borderLeft: "16px solid black",
                    }}
                  />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}