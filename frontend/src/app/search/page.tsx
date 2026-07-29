"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import RequireAuth from "@/components/RequireAuth";
import AlbumCard from "@/components/AlbumCard";
import { EmptyState, LoadingSpinner } from "@/components/States";
import {
  searchAlbums,
  addToLibrary,
  getLibrary,
  SearchResultItem,
} from "@/lib/api";

function SearchPageInner() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getLibrary()
      .then((items) =>
        setSavedIds(new Set(items.map((i) => i.appleCatalogId)))
      )
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchAlbums(term);
      setResults(data);
    } catch {
      setError("Search failed. The iTunes API might be unreachable right now.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 400);
  }

  async function handleSave(album: SearchResultItem) {
    setSavingId(album.appleCatalogId);
    try {
      await addToLibrary(album);
      setSavedIds((prev) => new Set(prev).add(album.appleCatalogId));
    } catch {
      setError("Couldn't save that album. It may already be in your library.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display italic text-3xl mb-1">Find albums</h1>
      <p className="text-crate-ink-muted mb-6 text-sm">
        Search the iTunes catalog and save what belongs in your crate.
      </p>

      <input
        autoFocus
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Try “Coldplay”, “Fleetwood Mac”, “Kendrick Lamar”…"
        className="w-full bg-crate-card border border-crate-line rounded-full px-5 py-3 outline-none focus:border-crate-accent mb-8"
      />

      {error && <p className="text-crate-red text-sm mb-4">{error}</p>}

      {loading && <LoadingSpinner label="Searching the catalog…" />}

      {!loading && searched && results.length === 0 && (
        <EmptyState
          title="No albums found"
          description="Try a different artist or album name."
        />
      )}

      {!loading && !searched && (
        <EmptyState
          title="Your search starts here"
          description="Type an artist or album name above — results update as you type."
        />
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((album) => (
            <AlbumCard
              key={album.appleCatalogId}
              album={album}
              saved={savedIds.has(album.appleCatalogId)}
              saving={savingId === album.appleCatalogId}
              onSave={() => handleSave(album)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchPageInner />
    </RequireAuth>
  );
}
