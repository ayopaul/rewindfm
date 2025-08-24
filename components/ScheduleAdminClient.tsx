// components/ScheduleAdminClient.tsx
"use client";

import * as React from "react";

export type ShowOpt = { id: string; title: string };
export type Slot = {
  id: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
  show: { id: string; title: string };
};

function minutesToHHMM(min: number) {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
function hhmmToMinutes(v: string) {
  const [h, m] = v.split(":").map((n) => parseInt(n, 10));
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

function DayBadge({ d }: { d: number }) {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <span className="inline-block border border-black px-2 py-0.5 bg-white text-sm">
      {names[d] ?? d}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl md:text-3xl mb-3"
      style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
    >
      {children}
    </h2>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm mb-1" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
      {children}
    </label>
  );
}

function Select({ className = "", ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full border border-black px-3 py-2 bg-white " + className
      }
    />
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full border border-black px-3 py-2 bg-white " + className
      }
    />
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center px-4 py-2 border border-black bg-[#FFF9E8] hover:translate-y-[1px] active:translate-y-[2px] transition " +
        className
      }
      style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
    />
  );
}

function Row({
  slot,
  onDelete,
  onUpdate,
  shows,
}: {
  slot: Slot;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: { dayOfWeek: number; showId: string; start: string; end: string }) => void;
  shows: ShowOpt[];
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    dayOfWeek: slot.dayOfWeek,
    showId: slot.show.id,
    start: minutesToHHMM(slot.startMin),
    end: minutesToHHMM(slot.endMin),
  });

  return (
    <div className="grid grid-cols-12 items-center gap-3 border border-black/10 bg-[#FDFDF1] px-3 py-2">
      {/* Day */}
      <div className="col-span-2">
        {editing ? (
          <select
            className="w-full border border-black bg-white px-2 py-1"
            value={draft.dayOfWeek}
            onChange={(e) => setDraft((d) => ({ ...d, dayOfWeek: Number(e.target.value) }))}
          >
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        ) : (
          <DayBadge d={slot.dayOfWeek} />
        )}
      </div>

      {/* Show */}
      <div className="col-span-4" style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}>
        {editing ? (
          <select
            className="w-full border border-black bg-white px-2 py-1"
            value={draft.showId}
            onChange={(e) => setDraft((d) => ({ ...d, showId: e.target.value }))}
          >
            {shows.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        ) : (
          slot.show.title
        )}
      </div>

      {/* Time */}
      <div className="col-span-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="time"
              className="border border-black bg-white px-2 py-1"
              value={draft.start}
              onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
            />
            <span>–</span>
            <input
              type="time"
              className="border border-black bg-white px-2 py-1"
              value={draft.end}
              onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
            />
          </div>
        ) : (
          <>
            {minutesToHHMM(slot.startMin)} – {minutesToHHMM(slot.endMin)}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-3 ml-auto flex items-center justify-end gap-2">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-black bg-white hover:bg-black/5"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onUpdate(slot.id, draft);
                setEditing(false);
              }}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-black bg-[#FFF9E8] hover:translate-y-[1px] active:translate-y-[2px] transition"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-black bg-white hover:bg-black/5"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(slot.id)}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-black bg-white hover:bg-black/5"
              style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ScheduleAdminClient({ shows }: { shows: ShowOpt[] }) {
  const [slots, setSlots] = React.useState<Slot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({
    dayOfWeek: new Date().getDay(),
    showId: shows[0]?.id ?? "",
    start: "09:00",
    end: "10:00",
  });
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/schedule", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load schedule");
      const data = await res.json();
      setSlots(data.items as Slot[]);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const body = {
        dayOfWeek: Number(form.dayOfWeek),
        showId: form.showId,
        startMin: hhmmToMinutes(form.start),
        endMin: hhmmToMinutes(form.end),
      };
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to create slot");
      }
      setForm((f) => ({ ...f, start: "09:00", end: "10:00" }));
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to delete slot");
      }
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  async function onUpdate(id: string, patch: { dayOfWeek: number; showId: string; start: string; end: string }) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: patch.dayOfWeek,
          showId: patch.showId,
          startMin: hhmmToMinutes(patch.start),
          endMin: hhmmToMinutes(patch.end),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to update slot");
      }
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Error");
    }
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <section className="rounded-none border border-black/10 bg-white p-5 md:p-6">
        <SectionTitle>Add Slot</SectionTitle>
        {error && <p className="mb-3 text-red-600">{error}</p>}
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <FieldLabel>Day</FieldLabel>
            <Select
              value={form.dayOfWeek}
              onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
            >
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
                <option key={d} value={i}>{d}</option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-4">
            <FieldLabel>Show</FieldLabel>
            <Select
              value={form.showId}
              onChange={(e) => setForm((f) => ({ ...f, showId: e.target.value }))}
            >
              {shows.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Start</FieldLabel>
            <Input
              type="time"
              value={form.start}
              onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}
              required
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>End</FieldLabel>
            <Input
              type="time"
              value={form.end}
              onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}
              required
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button type="submit">Add</Button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="rounded-none border border-black/10 bg-white p-5 md:p-6">
        <SectionTitle>Existing Slots</SectionTitle>
        {loading ? (
          <p>Loading…</p>
        ) : slots.length === 0 ? (
          <p>No slots yet.</p>
        ) : (
          <div className="space-y-2">
            {slots
              .slice()
              .sort((a, b) =>
                a.dayOfWeek === b.dayOfWeek
                  ? a.startMin - b.startMin
                  : a.dayOfWeek - b.dayOfWeek
              )
              .map((slot) => (
                <Row key={slot.id} slot={slot} shows={shows} onDelete={onDelete} onUpdate={onUpdate} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
