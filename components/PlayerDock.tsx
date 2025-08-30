// components/PlayerDock.tsx
"use client";

import { useAudio } from "./AudioProvider";

export default function PlayerDock() {
  const { isPlaying, now, play, stop, volume, setVolume } = useAudio();

  // This stream url is the default when opening the site
  const fallbackUrl =
    process.env.NEXT_PUBLIC_STREAM_URL || "https://example.com/stream.mp3";

  const onPlay = () => play(now?.url ?? fallbackUrl, now);
  const onStop = () => stop();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFEF1] border-t border-black/10">
      <div className="mx-auto max-w-screen-2xl px-4 py-3 flex items-center justify-between">
        {/* Keep your existing left section (artwork/title) */}
        <div className="flex items-center gap-3">
          {/* artwork */}
          <div className="h-10 w-10 rounded overflow-hidden bg-black/5">
            {/* if you already have an <Image> here, keep it */}
            {/* <Image ... src={now?.artwork ?? "/media/placeholder.jpg"} alt="" fill /> */}
          </div>
          <div className="text-sm leading-tight">
            <div className="font-semibold">{now?.showTitle ?? "Rewind FM"}</div>
            <div className="text-black/70">{now?.title ?? "Live stream"}</div>
          </div>
        </div>

        {/* Controls – wire into context; keep your icons/markup */}
        <div className="flex items-center gap-4">
          <button
            aria-label={isPlaying ? "Stop" : "Play"}
            onClick={isPlaying ? onStop : onPlay}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] bg-[#F24D3D] text-white"
          >
            {isPlaying ? "■" : "►"}
          </button>

          {/* Simple volume control (optional; keep your own UI if you already have one) */}
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}