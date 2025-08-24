"use client";
import * as React from "react";
import MediaPicker from "./MediaPicker";

export type OapItem = {
  id: string;
  name: string;
  role: string | null;
  imageUrl: string | null;
  twitter: string | null;
  instagram: string | null;
  bio: string | null;
};

export default function OapsAdminClient({ initialOaps = [] as OapItem[] }) {
  const [items, setItems] = React.useState<OapItem[]>(initialOaps);
  const [q, setQ] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [draftNew, setDraftNew] = React.useState<OapItem | null>(null);

  const filtered = React.useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())),
    [items, q]
  );

  async function createOap(d: Partial<OapItem>) {
    const res = await fetch("/api/admin/oaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Create failed");
    const j = await res.json();
    setItems((prev) => [{ id: j.id, name: String(d.name), role: d.role ?? null, imageUrl: d.imageUrl ?? null, twitter: d.twitter ?? null, instagram: d.instagram ?? null, bio: d.bio ?? null }, ...prev]);
  }

  async function updateOap(id: string, d: Partial<OapItem>) {
    const res = await fetch(`/api/admin/oaps/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Update failed");
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...d } as OapItem : it)));
  }

  async function deleteOap(id: string) {
    const res = await fetch(`/api/admin/oaps/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Delete failed");
    setItems((prev) => prev.filter((it) => it.id !== id));
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
            setDraftNew({ id: "", name: "", role: "", imageUrl: null, twitter: "", instagram: "", bio: "" });
          }}
        >
          + New OAP
        </button>
      </div>

      {/* Create new */}
      {creating && draftNew && (
        <div className="border border-black p-4 bg-white">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">Name
              <input className="w-full border border-black px-3 py-2" value={draftNew.name}
                onChange={(e) => setDraftNew({ ...draftNew, name: e.target.value })} />
            </label>
            <label className="block text-sm">Role
              <input className="w-full border border-black px-3 py-2" value={draftNew.role ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, role: e.target.value })} />
            </label>
            <label className="block text-sm">Twitter
              <input className="w-full border border-black px-3 py-2" value={draftNew.twitter ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, twitter: e.target.value })} />
            </label>
            <label className="block text-sm">Instagram
              <input className="w-full border border-black px-3 py-2" value={draftNew.instagram ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, instagram: e.target.value })} />
            </label>
            <label className="block text-sm col-span-full">Bio
              <textarea className="w-full border border-black px-3 py-2" value={draftNew.bio ?? ""}
                onChange={(e) => setDraftNew({ ...draftNew, bio: e.target.value })} />
            </label>
            <MediaPicker
              label="Profile Photo"
              value={draftNew.imageUrl}
              onChange={(url) => setDraftNew({ ...draftNew, imageUrl: url })}
              className="col-span-full"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              className="border border-black bg-black text-white px-3 py-2"
              onClick={async () => { await createOap(draftNew); setCreating(false); setDraftNew(null); }}
            >Create</button>
            <button className="border border-black px-3 py-2" onClick={() => { setCreating(false); setDraftNew(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="divide-y border border-black">
        {filtered.map((it) => (
          <Row key={it.id} item={it} onUpdate={updateOap} onDelete={deleteOap} />
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-black/60">No OAPs found.</div>
        )}
      </div>
    </div>
  );
}

function Row({ item, onUpdate, onDelete }: {
  item: OapItem;
  onUpdate: (id: string, d: Partial<OapItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<OapItem>(item);

  return (
    <div className="p-4">
      {editing ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">Name
            <input className="w-full border border-black px-3 py-2" value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </label>
          <label className="block text-sm">Role
            <input className="w-full border border-black px-3 py-2" value={draft.role ?? ""}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
          </label>
          <label className="block text-sm">Twitter
            <input className="w-full border border-black px-3 py-2" value={draft.twitter ?? ""}
              onChange={(e) => setDraft({ ...draft, twitter: e.target.value })} />
          </label>
          <label className="block text-sm">Instagram
            <input className="w-full border border-black px-3 py-2" value={draft.instagram ?? ""}
              onChange={(e) => setDraft({ ...draft, instagram: e.target.value })} />
          </label>
          <label className="block text-sm col-span-full">Bio
            <textarea className="w-full border border-black px-3 py-2" value={draft.bio ?? ""}
              onChange={(e) => setDraft({ ...draft, bio: e.target.value })} />
          </label>
          <MediaPicker
            label="Profile Photo"
            value={draft.imageUrl ? draft.imageUrl : null}
            onChange={(url: string | null) => setDraft((d) => ({ ...d, imageUrl: url ?? "" }))}
            className="col-span-full"
          />
          <div className="flex gap-3 col-span-full">
            <button className="border border-black bg-black text-white px-3 py-2" onClick={async () => { await onUpdate(item.id, draft); setEditing(false); }}>Save</button>
            <button className="border border-black px-3 py-2" onClick={() => { setDraft(item); setEditing(false); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-12 w-12 object-cover border border-black/10" />
          ) : (
            <div className="h-12 w-12 border border-black/10 bg-white" />
          )}
          <div className="flex-1">
            <div className="font-semibold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>{item.name}</div>
            <div className="text-sm text-black/60">{item.role || "—"}</div>
          </div>
          <div className="flex gap-2">
            <button className="border border-black px-3 py-2" onClick={() => setEditing(true)}>Edit</button>
            <button className="border border-black px-3 py-2" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}