// components/PlayerDock.tsx
"use client";

import { useAudio } from "./AudioProvider";

export default function PlayerDock() {
  const { isPlaying, isMuted, now, play, stop, volume, setVolume } = useAudio();

  // This stream url is the default when opening the site
  const fallbackUrl =
    process.env.NEXT_PUBLIC_STREAM_URL || "https://rewindfm-atunwadigital.streamguys1.com/rewindfm";

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

        {/* Controls – SHOW UNMUTE BUTTON WHEN MUTED */}
        <div className="flex items-center gap-4">
          {isMuted && isPlaying ? (
            /* Prominent Unmute Button - Matches Hero style */
            <button
              onClick={() => {
                const audio = document.querySelector('audio');
                if (audio) {
                  audio.muted = false;
                  // Trigger click event to activate the unmute listeners
                  const clickEvent = new MouseEvent('click', { bubbles: true });
                  document.dispatchEvent(clickEvent);
                }
              }}
              aria-label="Unmute to hear audio"
              title="Tap to hear the radio"
              className="inline-flex h-10 px-5 items-center justify-center shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] bg-[#F0C419] text-black font-semibold text-sm"
            >
              🔊 Tap to Unmute
            </button>
          ) : (
            <>
              <button
                aria-label={isPlaying ? "Stop" : "Play"}
                onClick={isPlaying ? onStop : onPlay}
                className="inline-flex h-10 w-10 items-center rounded-full justify-center shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] bg-[#F24D3D] text-white text-lg"
              >
                {isPlaying ? "■" : "▶"}
              </button>

              {/* Simple volume control */}
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}