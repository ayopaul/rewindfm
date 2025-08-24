"use client";

import { useEffect, useRef, useState } from "react";
import { Power, Disc3 } from "lucide-react";


type Station = { id: string; name: string; slug: string; streamUrl: string };

function DraggableNote({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
  
    useEffect(() => {
      const elCurrent = ref.current;
      const parentCurrent = elCurrent?.parentElement;
      if (!elCurrent || !parentCurrent) return;
  
      function onMove(e: PointerEvent) {
        if (!dragging.current || !elCurrent || !parentCurrent) return;
        const rect = parentCurrent.getBoundingClientRect();
        let nx = e.clientX - rect.left - offset.current.x;
        let ny = e.clientY - rect.top - offset.current.y;
        nx = Math.max(0, Math.min(nx, rect.width - elCurrent.offsetWidth));
        ny = Math.max(0, Math.min(ny, rect.height - elCurrent.offsetHeight));
        setPos({ x: nx, y: ny });
      }
  
      function onUp() {
        dragging.current = false;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      }
  
      function onDown(e: PointerEvent) {
        e.preventDefault();
        (e.target as Element).setPointerCapture?.(e.pointerId);
        dragging.current = true;
        offset.current = { x: e.offsetX, y: e.offsetY };
        document.addEventListener("pointermove", onMove, { passive: false });
        document.addEventListener("pointerup", onUp, { passive: true });
      }
  
      elCurrent.addEventListener("pointerdown", onDown);
      return () => {
        elCurrent.removeEventListener("pointerdown", onDown);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
    }, []);
  
    return (
      <div
        ref={ref}
        className={className}
        style={{ position: "absolute", left: pos.x, top: pos.y, touchAction: "none" }}
      >
        {children}
      </div>
    );
  }

export default function TurntableHero() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [level, setLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);


  // fetch stream from DB (admin manages this)
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/stations", { cache: "no-store" });
      const stations: Station[] = await res.json();
      setStation(stations?.[0] ?? null);
    })();
  }, []);

  // init audio element
 // init / swap audio element when station changes
useEffect(() => {
    if (!station?.streamUrl) return;
  
    const el = new Audio(station.streamUrl);
    el.preload = "none";
    el.crossOrigin = "anonymous";
    audioRef.current = el;
  
    // cleanup old audio + audio graph
    return () => {
      cancelAnimationFrame(rafRef.current);
      try {
        el.pause();
        el.src = "";
      } catch {}
      audioRef.current = null;
  
      try {
        srcRef.current?.disconnect();
        analyserRef.current?.disconnect();
        if (audioCtxRef.current?.state !== "closed") {
          audioCtxRef.current?.close();
        }
      } catch {}
      srcRef.current = null;
      analyserRef.current = null;
      audioCtxRef.current = null;
    };
  }, [station?.streamUrl]);

function ensureAnalyser() {
  if (!audioRef.current) return;
  if (audioCtxRef.current && analyserRef.current) return;

  const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
  const ctx: AudioContext = new Ctx();
  const src = ctx.createMediaElementSource(audioRef.current);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 32;

  src.connect(analyser);
  analyser.connect(ctx.destination);

  audioCtxRef.current = ctx;
  analyserRef.current = analyser;
  srcRef.current = src;

  const data = new Uint8Array(analyser.frequencyBinCount);
  const loop = () => {
    if (!analyserRef.current) return;
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setLevel(avg / 255);
    rafRef.current = requestAnimationFrame(loop);
  };
  rafRef.current = requestAnimationFrame(loop);
}

  const togglePower = async () => {
    const el = audioRef.current;
    setIsLoading(true);
    try {
      if (!el) return;

      if (isOn) {
        el.pause();
        setIsOn(false);
      } else {
        ensureAnalyser();
        if (audioCtxRef.current?.state === "suspended") {
          await audioCtxRef.current.resume();
        }
        await el.play();
        setIsOn(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // arm angle & record spin based on power
  const spinClass = isOn ? "animate-[spin_6s_linear_infinite]" : "";
  const armClass = isOn ? "rotate-[10deg]" : "rotate-[-25deg]";

  return (
    <section className="relative isolate overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,#1a0b1f_0%,#0b0b0d_55%,#000_100%)]" />
      <div className="absolute -top-24 -left-24 -z-10 h-[36rem] w-[36rem] rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 -z-10 h-[36rem] w-[36rem] rounded-full bg-rose-500/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 lg:px-8">
        {/* copy */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 text-sm text-white/70">
            <Disc3 className="h-4 w-4" /> Rewind FM — Live
          </span>
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Flip the switch. <span className="text-fuchsia-300">Drop the needle.</span>
          </h1>
          <p className="max-w-prose text-white/80">
            A retro turntable experience inspired by Project Turntable — power on to start streaming.
          </p>

          <button
            onClick={togglePower}
            disabled={isLoading || !station}
            className={`group inline-flex items-center gap-2 rounded-full border px-5 py-2 text-white transition
              ${isOn ? "border-fuchsia-400 bg-fuchsia-500/20" : "border-white/20 hover:border-white/40"}
              disabled:opacity-50`}
            aria-pressed={isOn}
          >
            <span className={`grid place-items-center rounded-full p-1 transition ${isOn ? "bg-fuchsia-400" : "bg-white/20"}`}>
              <Power className="h-4 w-4" />
            </span>
            {isOn ? "Turn Off" : "Turn On"}
          </button>

          {/* simple level meter */}
          <div className="mt-4 flex h-8 items-end gap-1">
            {Array.from({ length: 16 }).map((_, i) => {
              const t = Math.max(0, level - i * 0.03);
              return <div key={i} className="w-2 rounded-t bg-gradient-to-t from-fuchsia-500/30 to-fuchsia-300"
                          style={{ height: `${t * 100}%` }}/>;
            })}
          </div>

          <div className="text-xs text-white/60">
            Station: {station?.name ?? "—"} • Stream: {station?.streamUrl ? "Configured" : "Not set"}
          </div>
        </div>

        {/* deck */}
        <div className="relative">
          <div className="relative h-80 w-full rounded-[2rem] border border-white/10 bg-zinc-900 p-6 shadow-2xl md:h-[28rem]">
            {/* platter */}
            <div className="relative mx-auto mt-4 h-60 w-60 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-700 shadow-inner md:h-72 md:w-72">
              {/* record */}
              <div className={`absolute inset-3 rounded-full bg-[conic-gradient(#111_0_25%,#1a1a1a_0_50%,#111_0_75%,#1a1a1a_0_100%)] ${spinClass}`} />
              {/* label */}
              <div className={`absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full
                               ${isOn ? "bg-fuchsia-400" : "bg-zinc-400"}`} />
              {/* spindle */}
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>

            {/* tonearm */}
            <div className={`absolute right-10 top-10 origin-top-right transition-transform duration-500 ${armClass}`}>
              <div className="h-40 w-3 rounded-full bg-zinc-700 shadow" />
              <div className="mt-1 h-6 w-6 rotate-12 rounded-sm bg-zinc-500" />
            </div>

            {/* power lamp */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${isOn ? "bg-fuchsia-400 shadow-[0_0_12px_rgba(244,114,182,.9)]" : "bg-white/30"}`} />
              <span className="text-xs text-white/70">{isOn ? "ON" : "OFF"}</span>
            </div>

            {/* draggable stickers */}
            <DraggableNote className="left-6 top-6 select-none rounded-md bg-fuchsia-500/80 px-2 py-1 text-xs font-semibold text-white rotate-[-12deg] cursor-grab active:cursor-grabbing">
              Rewind
            </DraggableNote>
            <DraggableNote className="right-8 bottom-16 select-none rounded-md bg-emerald-400/90 px-2 py-1 text-xs font-semibold text-black rotate-[9deg] cursor-grab active:cursor-grabbing">
              Classic
            </DraggableNote>
          </div>
        </div>
      </div>
    </section>
  );
}