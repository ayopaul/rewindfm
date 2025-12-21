"use client";

import * as React from "react";
import { toast } from "sonner";
import MediaPicker from "./MediaPicker";

type ShowOpt = { id: string; title: string };

export type OapItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  twitter: string | null;
  instagram: string | null;
  bio: string | null;
  showIds: string[]; // related shows for this OAP
};

function ShowSelector({
  options,
  value,
  onChange,
  onShowCreated,
  className,
}: {
  options: ShowOpt[];
  value: string[];
  onChange: (ids: string[]) => void;
  onShowCreated?: (show: ShowOpt) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [newShowTitle, setNewShowTitle] = React.useState("");
  const [newShowDesc, setNewShowDesc] = React.useState("");
  const [savingShow, setSavingShow] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.title.toLowerCase().includes(q));
  }, [options, query]);

  const showCreateOption = query.trim().length > 0 && filtered.length === 0;

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  async function handleCreateShow() {
    if (!newShowTitle.trim()) {
      toast.error("Please enter a show title");
      return;
    }
    setSavingShow(true);
    try {
      const res = await fetch("/api/admin/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newShowTitle.trim(),
          description: newShowDesc.trim() || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Failed to create show");
      }
      const j = await res.json();
      const newShow = { id: j.id, title: newShowTitle.trim() };
      toast.success(`Show "${newShowTitle}" created!`);
      onShowCreated?.(newShow);
      // Automatically select the new show
      onChange([...value, j.id]);
      setCreating(false);
      setNewShowTitle("");
      setNewShowDesc("");
      setQuery("");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create show");
    } finally {
      setSavingShow(false);
    }
  }

  const selectedLabels = React.useMemo(() => {
    if (!value?.length) return [] as string[];
    const map = new Map(options.map((o) => [o.id, o.title] as const));
    return value.map((id) => map.get(id) || id);
  }, [value, options]);

  return (
    <div className={className} ref={ref}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm">Shows</div>
        {selectedLabels.length > 0 && (
          <div className="text-xs text-black/60">{selectedLabels.length} selected</div>
        )}
      </div>

      {/* Control */}
      <button
        type="button"
        className="w-full border border-black bg-white px-3 py-2 text-left flex items-center justify-between gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length === 0 ? (
            <span className="text-black/50">Select shows…</span>
          ) : (
            selectedLabels.slice(0, 3).map((t) => (
              <span key={t} className="border border-black px-2 py-0.5 text-xs bg-[#FFFDF4]">
                {t}
              </span>
            ))
          )}
          {selectedLabels.length > 3 && (
            <span className="text-xs text-black/60">+{selectedLabels.length - 3} more</span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9l6 6 6-6" stroke="black" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {open && !creating && (
        <div className="mt-2 border border-black bg-white shadow-sm">
          <div className="p-2 border-b border-black/20">
            <input
              autoFocus
              placeholder="Search shows…"
              className="w-full border border-black px-2 py-1"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul role="listbox" className="max-h-[200px] overflow-auto">
            {filtered.length === 0 && !showCreateOption && (
              <li className="px-3 py-2 text-black/60 text-sm">No matches</li>
            )}
            {showCreateOption && (
              <li className="px-3 py-2">
                <button
                  type="button"
                  className="w-full text-left flex items-center gap-2 hover:bg-[#FFF9E8] px-2 py-1 border border-dashed border-black/30"
                  onClick={() => {
                    setNewShowTitle(query.trim());
                    setCreating(true);
                  }}
                >
                  <span className="text-lg">+</span>
                  <span>Create &quot;{query.trim()}&quot;</span>
                </button>
              </li>
            )}
            {filtered.map((opt) => {
              const checked = value.includes(opt.id);
              return (
                <li key={opt.id} role="option" aria-selected={checked}>
                  <label className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#FFF9E8]">
                    <input
                      type="checkbox"
                      className="accent-black"
                      checked={checked}
                      onChange={() => toggle(opt.id)}
                    />
                    <span>{opt.title}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="p-2 flex items-center justify-between border-t border-black/20 text-xs text-black/60">
            <button
              type="button"
              className="border border-black px-2 py-1"
              onClick={() => onChange([])}
            >
              Clear
            </button>
            <button
              type="button"
              className="border border-black px-2 py-1"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Inline show creation form */}
      {open && creating && (
        <div className="mt-2 border border-black bg-white shadow-sm p-3">
          <div className="text-sm font-bold mb-2" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
            Create New Show
          </div>
          <div className="space-y-2">
            <input
              autoFocus
              placeholder="Show title"
              className="w-full border border-black px-2 py-1"
              value={newShowTitle}
              onChange={(e) => setNewShowTitle(e.target.value)}
            />
            <textarea
              placeholder="Description (optional)"
              className="w-full border border-black px-2 py-1 min-h-[60px]"
              value={newShowDesc}
              onChange={(e) => setNewShowDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className="border border-black bg-black text-white px-3 py-1 disabled:opacity-50"
              disabled={savingShow || !newShowTitle.trim()}
              onClick={handleCreateShow}
            >
              {savingShow ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              className="border border-black px-3 py-1"
              onClick={() => {
                setCreating(false);
                setNewShowTitle("");
                setNewShowDesc("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OapsAdminClient({ initialOaps = [] as OapItem[] }) {
  const [items, setItems] = React.useState<OapItem[]>(initialOaps);
  const [q, setQ] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [draftNew, setDraftNew] = React.useState<OapItem | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [showOpts, setShowOpts] = React.useState<ShowOpt[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/shows?lite=1", { cache: "no-store" });
        const j = await res.json().catch(() => []);
        const arr = Array.isArray(j?.items) ? j.items : Array.isArray(j) ? j : [];
        setShowOpts(arr.map((s: any) => ({ id: String(s.id), title: String(s.title) })));
      } catch {}
    })();
  }, []);

  const filtered = React.useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  function handleShowCreated(show: ShowOpt) {
    setShowOpts((prev) => [...prev, show]);
  }

  async function createOap(d: Partial<OapItem>) {
    setErrorMsg(null);
    setSaving(true);
    try {
      if (!d.name || !d.name.trim()) {
        toast.error("Please enter a name");
        setErrorMsg("Please enter a name.");
        return;
      }
      const res = await fetch("/api/admin/oaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Create failed");
      }
      const j = await res.json();
      setItems((prev) => [
        {
          id: j.id,
          name: String(d.name),
          imageUrl: d.imageUrl ?? null,
          twitter: d.twitter ?? null,
          instagram: d.instagram ?? null,
          bio: d.bio ?? null,
          showIds: Array.isArray(d.showIds) ? (d.showIds as string[]) : [],
        },
        ...prev,
      ]);
      toast.success(`OAP "${d.name}" created successfully!`);
      setCreating(false);
      setDraftNew(null);
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
      setErrorMsg(e?.message || "Create failed");
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function updateOap(id: string, d: Partial<OapItem>) {
    try {
      const res = await fetch(`/api/admin/oaps/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Update failed");
      }
      setItems((prev) => prev.map((it) => (it.id === id ? ({ ...it, ...d } as OapItem) : it)));
      toast.success("OAP updated successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
      throw e;
    }
  }

  async function deleteOap(id: string) {
    try {
      const res = await fetch(`/api/admin/oaps/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Delete failed");
      }
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("OAP deleted successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
      throw e;
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <input
          placeholder="Search OAPs…"
          className="border border-black px-3 py-2 md:w-80"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex-1" />
        <button
          className="border border-black bg-[#FFF9E8] px-3 py-2"
          onClick={() => {
            setCreating(true);
            setDraftNew({
              id: "",
              name: "",
              imageUrl: null,
              twitter: "",
              instagram: "",
              bio: "",
              showIds: [],
            } as unknown as OapItem);
          }}
        >
          + New OAP
        </button>
      </div>

      {/* Create new */}
      {creating && draftNew && (
        <div className="border border-black p-4 bg-white">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              Name
              <input
                className="w-full border border-black px-3 py-2"
                value={draftNew.name}
                onChange={(e) => setDraftNew({ ...draftNew, name: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Twitter
              <input
                className="w-full border border-black px-3 py-2"
                value={draftNew.twitter ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, twitter: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              Instagram
              <input
                className="w-full border border-black px-3 py-2"
                value={draftNew.instagram ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, instagram: e.target.value })}
              />
            </label>
            <label className="block text-sm col-span-full">
              Bio
              <textarea
                className="w-full border border-black px-3 py-2"
                value={draftNew.bio ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, bio: e.target.value })}
              />
            </label>
            <MediaPicker
              label="Profile Photo"
              value={draftNew.imageUrl}
              onChange={(url) => setDraftNew({ ...draftNew, imageUrl: url })}
              className="col-span-full"
            />
            <ShowSelector
              options={showOpts}
              value={draftNew.showIds ?? []}
              onChange={(ids) => setDraftNew({ ...draftNew, showIds: ids })}
              onShowCreated={handleShowCreated}
              className="col-span-full"
            />
          </div>
          {errorMsg && (
            <div className="mt-2 text-sm text-red-600" role="alert">{errorMsg}</div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              className="border border-black bg-black text-white px-3 py-2 disabled:opacity-50"
              disabled={saving || !draftNew.name?.trim()}
              onClick={async () => {
                await createOap(draftNew);
              }}
            >
              {saving ? "Saving…" : "Create"}
            </button>
            <button
              className="border border-black px-3 py-2"
              onClick={() => {
                setCreating(false);
                setDraftNew(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y border border-black">
        {filtered.map((it) => (
          <Row key={it.id} item={it} onUpdate={updateOap} onDelete={deleteOap} showOpts={showOpts} onShowCreated={handleShowCreated} />
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-black/60">No OAPs found.</div>
        )}
      </div>
    </div>
  );
}

function Row({
  item,
  onUpdate,
  onDelete,
  showOpts,
  onShowCreated,
}: {
  item: OapItem;
  onUpdate: (id: string, d: Partial<OapItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showOpts: ShowOpt[];
  onShowCreated: (show: ShowOpt) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<OapItem>(item);

  return (
    <div className="p-4">
      {editing ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            Name
            <input
              className="w-full border border-black px-3 py-2"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Twitter
            <input
              className="w-full border border-black px-3 py-2"
              value={draft.twitter ?? ""}
              onChange={(e) => setDraft({ ...draft, twitter: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            Instagram
            <input
              className="w-full border border-black px-3 py-2"
              value={draft.instagram ?? ""}
              onChange={(e) => setDraft({ ...draft, instagram: e.target.value })}
            />
          </label>
          <label className="block text-sm col-span-full">
            Bio
            <textarea
              className="w-full border border-black px-3 py-2"
              value={draft.bio ?? ""}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            />
          </label>
          <MediaPicker
            label="Profile Photo"
            value={draft.imageUrl ? draft.imageUrl : null}
            onChange={(url) => setDraft((d) => ({ ...d, imageUrl: url }))}
            className="col-span-full"
          />
          <ShowSelector
            options={showOpts}
            value={draft.showIds ?? []}
            onChange={(ids) => setDraft({ ...draft, showIds: ids })}
            onShowCreated={onShowCreated}
            className="col-span-full"
          />
          <div className="flex gap-3 col-span-full">
            <button
              className="border border-black bg-black text-white px-3 py-2"
              onClick={async () => {
                await onUpdate(item.id, draft);
                setEditing(false);
              }}
            >
              Save
            </button>
            <button
              className="border border-black px-3 py-2"
              onClick={() => {
                setDraft(item);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          { }
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-12 w-12 object-cover border border-black/10"
            />
          ) : (
            <div className="h-12 w-12 border border-black/10 bg-white" />
          )}
          <div className="flex-1">
            <div className="font-semibold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
              {item.name}
            </div>
            <div className="text-sm text-black/60">
              {(() => {
                if (!item.showIds || item.showIds.length === 0) return "No shows";
                const map = new Map(showOpts.map((s) => [s.id, s.title]));
                const names = item.showIds.map((id) => map.get(id) || "Unknown").filter(Boolean);
                return `Shows: ${names.join(", ")}`;
              })()}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="border border-black px-3 py-2" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="border border-black px-3 py-2" onClick={() => onDelete(item.id)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}