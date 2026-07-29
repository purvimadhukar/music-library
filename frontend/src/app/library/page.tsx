"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import RatingStars from "@/components/RatingStars";
import { EmptyState, LoadingSpinner } from "@/components/States";
import {
  getLibrary,
  updateLibraryItem,
  deleteLibraryItem,
  LibraryItemResponse,
} from "@/lib/api";

function LibraryPageInner() {
  const [items, setItems] = useState<LibraryItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");

  async function load() {
    setLoading(true);
    try {
      setItems(await getLibrary());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    load();
  }, []);

  async function handleRate(id: number, rating: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, userRating: rating } : i))
    );
    await updateLibraryItem(id, { userRating: rating });
  }

  async function handleSaveNotes(id: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, userNotes: notesDraft } : i))
    );
    await updateLibraryItem(id, { userNotes: notesDraft });
    setEditingNotesId(null);
  }

  async function handleDelete(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteLibraryItem(id);
  }

  if (loading) return <LoadingSpinner label="Loading your library…" />;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-baseline justify-between mb-1">
        <h1 className="font-display italic text-3xl">Your library</h1>
        <span className="text-sm text-crate-ink-muted font-mono">
          {items.length} album{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="text-crate-ink-muted mb-8 text-sm">
        Rate albums and jot notes — this feeds your analytics and AI insights.
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Search the catalog and save a few albums to start building your library."
          action={
            <Link
              href="/search"
              className="inline-block bg-crate-accent text-crate-accent-ink rounded-full px-5 py-2.5 font-medium"
            >
              Search albums
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-crate-card border border-crate-line rounded-xl p-4 flex flex-col sm:flex-row gap-4"
            >
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-crate-bg-raised">
                {item.artworkUrl && (
                  <Image
                    src={item.artworkUrl.replace("100x100", "200x200")}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-crate-ink truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-crate-ink-muted truncate">
                      {item.artistName}
                    </p>
                    <p className="text-xs text-crate-ink-muted font-mono mt-0.5">
                      {item.releaseDate?.slice(0, 4) ?? "—"} ·{" "}
                      {item.genre ?? "Unknown"} · {item.trackCount ?? "?"} tracks
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-crate-ink-muted hover:text-crate-red shrink-0"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <RatingStars
                    value={item.userRating}
                    onChange={(v) => handleRate(item.id, v)}
                  />

                  {editingNotesId === item.id ? (
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <input
                        autoFocus
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add a note…"
                        className="flex-1 bg-crate-bg-raised border border-crate-line rounded-full px-3 py-1.5 text-sm outline-none focus:border-crate-accent"
                      />
                      <button
                        onClick={() => handleSaveNotes(item.id)}
                        className="text-xs text-crate-accent font-medium"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNotesId(item.id);
                        setNotesDraft(item.userNotes ?? "");
                      }}
                      className="text-xs text-crate-ink-muted hover:text-crate-ink italic"
                    >
                      {item.userNotes ? `"${item.userNotes}"` : "+ Add a note"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <RequireAuth>
      <LibraryPageInner />
    </RequireAuth>
  );
}
