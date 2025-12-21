// components/ShowsAdminClient.tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import MediaPicker from "./MediaPicker";

type ShowItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm mb-1" style={{ fontFamily: "'Neue Plak', sans-serif" }}>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={"w-full border border-black px-3 py-2 bg-white " + (props.className || "")} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={"w-full border border-black px-3 py-2 bg-white min-h-[96px] " + (props.className || "")} />;
}
function Button({ className = "", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) {
  return (
    <button
      {...rest}
      className={
        "inline-flex items-center justify-center px-4 py-2 border border-black bg-[#FFF9E8] hover:translate-y-[1px] active:translate-y-[2px] transition " +
        className
      }
      style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
    >
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-none border border-black/10 bg-white p-5 md:p-6">{children}</div>;
}

function Row({
  show,
  onManageOaps,
  onDelete,
  onUpdate,
}: {
  show: ShowItem;
  onManageOaps: (show: ShowItem) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<ShowItem, "title" | "description" | "imageUrl">>) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    title: show.title,
    description: show.description ?? "",
    imageUrl: show.imageUrl ?? "",
  });

  return (
    <div className="grid grid-cols-12 gap-3 border border-black/10 bg-[#FDFDF1] px-3 py-3">
      {/* Thumb */}
      <div className="col-span-2">
        <div className="h-16 w-16 border border-black/10 bg-[#F5DCB7] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {show.imageUrl ? <img src={show.imageUrl} alt={show.title} className="h-full w-full object-cover" /> : null}
        </div>
      </div>

      {/* Title + Desc */}
      <div className="col-span-7 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description (optional)"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          
          <MediaPicker
            label="Show Image"
            value={draft.imageUrl ? draft.imageUrl : null}
            onChange={(url) =>
              setDraft((d) => ({ ...d, imageUrl: url ?? "" }))
            }
          />
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }} className="text-lg truncate">
              {show.title}
            </div>
            <p className="text-black/70 line-clamp-2">{show.description}</p>
            {show.imageUrl ? <p className="text-xs text-black/50 mt-1 truncate">{show.imageUrl}</p> : null}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-3 ml-auto flex items-start justify-end gap-2">
        {editing ? (
          <>
            <Button onClick={() => setEditing(false)} className="bg-white">Cancel</Button>
            <Button
              onClick={() => {
                onUpdate(show.id, draft);
                setEditing(false);
              }}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setEditing(true)} className="bg-white">Edit</Button>
            <Button onClick={() => onManageOaps(show)} className="bg-white">Manage OAPs</Button>
            <Button onClick={() => onDelete(show.id)} className="bg-white">Delete</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ShowsAdminClient({ initialShows = [] as ShowItem[] }) {
  const [items, setItems] = React.useState<ShowItem[]>(initialShows);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [manageFor, setManageFor] = React.useState<ShowItem | null>(null);

  // Create form state
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    imageUrl: "",
  });

  // Search state (moved inside component)
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter((i) =>
      i.title.toLowerCase().includes(s) || (i.description ?? "").toLowerCase().includes(s)
    );
  }, [q, items]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shows", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load shows");
      const data = await res.json();
      setItems(data.items as ShowItem[]);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // If SSR preloaded, still refresh to stay consistent with DB
    refresh();
  }, [refresh]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
      };
      if (!payload.title) {
        toast.error("Title is required");
        throw new Error("Title is required");
      }
      const res = await fetch("/api/admin/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to create show");
      }
      toast.success(`Show "${payload.title}" created successfully!`);
      setForm({ title: "", description: "", imageUrl: "" });
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Error creating show");
      setError(e?.message || "Error");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/shows/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to delete show");
      }
      toast.success("Show deleted successfully!");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Error deleting show");
      setError(e?.message || "Error");
    }
  }

  async function onUpdate(id: string, patch: Partial<Pick<ShowItem, "title" | "description" | "imageUrl">>) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/shows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Unable to update show");
      }
      toast.success("Show updated successfully!");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "Error updating show");
      setError(e?.message || "Error");
    }
  }

  return (
    <div
      className="min-h-screen w-full space-y-8"
      style={{
        backgroundColor: "#FFFEF1",
        backgroundImage: "url('/media/5df82e05767bad4244dc8b5c_expanded-texture.gif')",
      }}
    >
      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shows…"
          className="w-full max-w-md border border-black px-3 py-2 bg-white"
        />
      </div>

      {/* Create */}
      <Card>
        <h2
          className="text-2xl md:text-3xl mb-3"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
        >
          Add Show
        </h2>
        {error && <p className="mb-3 text-red-600">{error}</p>}
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <FieldLabel>Title</FieldLabel>
            <Input
              placeholder="e.g. Morning Drive"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="md:col-span-5">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              placeholder="Short summary (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3">
            <MediaPicker
              label="Show Image"
              value={form.imageUrl || null}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url || "" }))}
            />
          </div>
          <div className="md:col-span-12 flex items-end justify-end">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <Card>
        <h2
          className="text-2xl md:text-3xl mb-3"
          style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}
        >
          Existing Shows
        </h2>
        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p>No shows found.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => (
              <Row
                key={s.id}
                show={s}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onManageOaps={(show) => setManageFor(show)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* OAP Manager Dialog */}
      {manageFor && (
        <OapAssignmentDialog
          show={{ id: manageFor.id, title: manageFor.title }}
          onClose={() => setManageFor(null)}
        />
      )}
    </div>
  );
}

function OapAssignmentDialog({
  show,
  onClose,
}: {
  show: { id: string; title: string };
  onClose: () => void;
}) {
  const [loading, setLoading] = React.useState(true);
  const [oaps, setOaps] = React.useState<{ id: string; name: string; imageUrl: string | null }[]>([]);
  const [assigned, setAssigned] = React.useState<{ oapId: string; role: string | null }[]>([]);
  const [roleByOap, setRoleByOap] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, asgRes] = await Promise.all([
        fetch("/api/admin/oaps", { cache: "no-store" }),
        fetch(`/api/admin/shows/${show.id}/oaps`, { cache: "no-store" }),
      ]);
      if (!allRes.ok || !asgRes.ok) throw new Error("Load failed");
      const all = await allRes.json();
      const asg = await asgRes.json();
      setOaps(all.items || []);
      setAssigned((asg.items || []).map((x: any) => ({ oapId: x.oap.id, role: x.role })));
      const map: Record<string, string> = {};
      (asg.items || []).forEach((x: any) => (map[x.oap.id] = x.role ?? ""));
      setRoleByOap(map);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }, [show.id]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const assignedSet = new Set(assigned.map((a) => a.oapId));

  async function assign(oapId: string) {
    setError(null);
    const role = roleByOap[oapId] ?? "";
    const res = await fetch(`/api/admin/shows/${show.id}/oaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oapId, role: role || null }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Assign failed");
    } else {
      await refresh();
    }
  }

  async function unassign(oapId: string) {
    setError(null);
    const res = await fetch(`/api/admin/shows/${show.id}/oaps?oapId=${oapId}`, { method: "DELETE" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Unassign failed");
    } else {
      await refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[min(900px,95vw)] max-h-[85vh] overflow-auto border border-black bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl" style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}>
            Manage OAPs — {show.title}
          </h3>
          <button className="border border-black bg-[#FFF9E8] px-3 py-1.5" onClick={onClose}>Close</button>
        </div>
        {error && <p className="mb-3 text-red-600">{error}</p>}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* All OAPs */}
            <div>
              <h4 className="mb-2 font-bold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>All OAPs</h4>
              <div className="space-y-2">
                {oaps.map((o) => {
                  const isAsg = assignedSet.has(o.id);
                  return (
                    <div key={o.id} className="flex items-center justify-between border border-black/10 bg-[#FDFDF1] px-3 py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {o.imageUrl ? <img src={o.imageUrl} alt={o.name} className="h-10 w-10 object-cover border border-black/10" /> : <div className="h-10 w-10 border border-black/10" />}
                        <div className="truncate">{o.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="border border-black px-2 py-1"
                          placeholder="Role (optional)"
                          value={roleByOap[o.id] ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setRoleByOap((prev) => ({ ...prev, [o.id]: v }));
                          }}
                        />
                        {isAsg ? (
                          <button className="border border-black bg-white px-3 py-1.5" onClick={() => unassign(o.id)}>Unassign</button>
                        ) : (
                          <button className="border border-black bg-[#FFF9E8] px-3 py-1.5" onClick={() => assign(o.id)}>Assign</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assigned */}
            <div>
              <h4 className="mb-2 font-bold" style={{ fontFamily: "'Neue Plak', sans-serif" }}>Assigned</h4>
              <div className="space-y-2">
                {assigned.length === 0 ? <p className="text-black/60">No OAPs assigned yet.</p> : null}
                {assigned.map((a) => {
                  const o = oaps.find((x) => x.id === a.oapId);
                  if (!o) return null;
                  return (
                    <div key={o.id} className="flex items-center justify-between border border-black/10 bg-white px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate" style={{ fontFamily: "'Neue Plak', sans-serif", fontWeight: 700 }}>{o.name}</div>
                        <div className="text-sm text-black/60">{a.role || "—"}</div>
                      </div>
                      <button className="border border-black bg-white px-3 py-1.5" onClick={() => unassign(o.id)}>Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}