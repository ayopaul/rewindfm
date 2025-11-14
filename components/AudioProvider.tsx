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
  isMuted: boolean;
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
  const [isMuted, setMuted] = React.useState(false);
  const [now, setNow] = React.useState<NowPlaying | undefined>(undefined);
  const [volume, setVolumeState] = React.useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const v = localStorage.getItem("rfm:vol");
    return v ? Number(v) : 1;
  });

  // Create audio element and setup autoplay - ALL IN ONE EFFECT
  React.useEffect(() => {
    console.log("🎵 AudioProvider mounted - initializing audio element");
    
    // Create audio element
    const a = new Audio();
    a.preload = "none";
    a.crossOrigin = "anonymous";
    a.volume = volume;
    
    console.log("🔊 Audio element created, volume:", volume);
    
    // Setup event listeners for state synchronization
    const handleCanPlay = () => {
      console.log("✓ Audio can play");
      setReady(true);
    };
    const handlePlay = () => {
      console.log("▶ Audio playing");
      setPlaying(true);
    };
    const handlePause = () => {
      console.log("⏸ Audio paused");
      setPlaying(false);
    };
    const handleEnded = () => {
      console.log("⏹ Audio ended");
      setPlaying(false);
    };
    const handleError = (e: Event) => {
      console.error("❌ Audio error:", e);
      setPlaying(false);
      setReady(false);
    };
    
    a.addEventListener("canplay", handleCanPlay);
    a.addEventListener("play", handlePlay);
    a.addEventListener("pause", handlePause);
    a.addEventListener("ended", handleEnded);
    a.addEventListener("error", handleError);
    
    audioRef.current = a;
    
    // AUTOPLAY: Start playing immediately
    const defaultUrl = process.env.NEXT_PUBLIC_STREAM_URL || 
                       "https://rewindfm-atunwadigital.streamguys1.com/rewindfm";
    
    console.log("🌐 Stream URL:", defaultUrl);
    
    if (defaultUrl) {
      // Small delay to ensure audio element is fully initialized
      const autoplayTimer = setTimeout(async () => {
        console.log("⏰ Autoplay timer fired, attempting to play...");
        try {
          a.src = defaultUrl;
          console.log("📡 Audio src set to:", defaultUrl);
          
          // Start MUTED to bypass browser autoplay restrictions
          a.muted = true;
          setMuted(true);
          console.log("🔇 Starting muted to bypass autoplay block");
          
          await a.play();
          
          setNow({ 
            url: defaultUrl, 
            title: "Live Stream",
            showTitle: "Rewind FM" 
          });
          
          console.log("✅ Autoplay started successfully (muted)");
          
          // Auto-unmute on ANY user interaction
          const unmuteOnInteraction = () => {
            console.log("👆 User interaction detected - unmuting audio");
            a.muted = false;
            setMuted(false);
            document.removeEventListener('click', unmuteOnInteraction);
            document.removeEventListener('touchstart', unmuteOnInteraction);
            document.removeEventListener('keydown', unmuteOnInteraction);
            console.log("🔊 Audio unmuted!");
          };
          
          document.addEventListener('click', unmuteOnInteraction, { once: true });
          document.addEventListener('touchstart', unmuteOnInteraction, { once: true });
          document.addEventListener('keydown', unmuteOnInteraction, { once: true });
          
        } catch (err: any) {
          console.error("⚠️ Autoplay blocked by browser:", err.name, err.message);
          // Fallback: User will need to click play button
        }
      }, 300);
      
      // Cleanup function
      return () => {
        console.log("🧹 Cleaning up audio element");
        clearTimeout(autoplayTimer);
        a.removeEventListener("canplay", handleCanPlay);
        a.removeEventListener("play", handlePlay);
        a.removeEventListener("pause", handlePause);
        a.removeEventListener("ended", handleEnded);
        a.removeEventListener("error", handleError);
        a.pause();
        a.src = "";
        audioRef.current = null;
      };
    }
    
    // Cleanup if no autoplay
    return () => {
      console.log("🧹 Cleaning up audio element (no autoplay)");
      a.removeEventListener("canplay", handleCanPlay);
      a.removeEventListener("play", handlePlay);
      a.removeEventListener("pause", handlePause);
      a.removeEventListener("ended", handleEnded);
      a.removeEventListener("error", handleError);
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
  }, []); // Empty deps - run once on mount

  const play: AudioContextShape["play"] = async (url, meta) => {
    const a = audioRef.current;
    if (!a) return;

    // If switching stations/streams, set a new src
    if (a.src !== url) {
      a.src = url;
    }

    setNow({ url, ...meta });
    
    try {
      await a.play();
    } catch (err) {
      console.warn("Audio play() blocked or failed:", err);
      throw err; // Let caller handle the error
    }
  };

  const stop = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
  };

  const setVolume = (v: number) => {
    const a = audioRef.current;
    const vv = Math.min(1, Math.max(0, v));
    if (a) a.volume = vv;
    setVolumeState(vv);
    if (typeof window !== "undefined") {
      localStorage.setItem("rfm:vol", String(vv));
    }
  };

  return (
    <AudioCtx.Provider value={{ isReady, isPlaying, isMuted, now, volume, play, stop, setVolume }}>
      {children}
    </AudioCtx.Provider>
  );
};