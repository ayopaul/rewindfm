// components/AudioProvider.tsx
"use client";

import React from "react";

type NowPlaying = {
  url: string;
  title?: string;
  artwork?: string;
  showTitle?: string;
};

type AudioContextShape = {
  isReady: boolean;
  isPlaying: boolean;
  now?: NowPlaying;
  volume: number;
  play: (url: string, meta?: Omit<NowPlaying, "url">) => Promise<void>;
  stop: () => void;
  setVolume: (v: number) => void;
};

const AudioCtx = React.createContext<AudioContextShape | null>(null);

export function useAudio() {
  const ctx = React.useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within <AudioProvider>");
  return ctx;
}

export const AudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isReady, setReady] = React.useState(false);
  const [isPlaying, setPlaying] = React.useState(false);
  const [now, setNow] = React.useState<NowPlaying | undefined>(undefined);
  const [volume, setVolumeState] = React.useState<number>(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("rfm:vol") : null;
    return v ? Number(v) : 1;
  });

  // create audio element once on mount
  React.useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    a.crossOrigin = "anonymous";
    a.volume = volume;
    a.addEventListener("canplay", () => setReady(true));
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    a.addEventListener("ended", () => setPlaying(false));
    a.addEventListener("error", () => {
      setPlaying(false);
      setReady(false);
      // keep the element but clear meta so UI can show an error state if you want
    });
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  const play: AudioContextShape["play"] = async (url, meta) => {
    const a = audioRef.current;
    if (!a) return;

    // If switching stations/streams, set a new src
    if (a.src !== url) {
      a.src = url;
    }

    setNow({ url, ...meta });
    try {
      await a.play(); // requires user gesture on iOS/Chrome
    } catch (err) {
      console.warn("Audio play() blocked or failed:", err);
    }
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    // Do not clear src so user can resume quickly; keep meta
  };

  const setVolume = (v: number) => {
    const a = audioRef.current;
    const vv = Math.min(1, Math.max(0, v));
    if (a) a.volume = vv;
    setVolumeState(vv);
    if (typeof window !== "undefined") localStorage.setItem("rfm:vol", String(vv));
  };

  return (
    <AudioCtx.Provider value={{ isReady, isPlaying, now, volume, play, stop, setVolume }}>
      {children}
    </AudioCtx.Provider>
  );
};