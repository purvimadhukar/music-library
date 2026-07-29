"use client";

import Image from "next/image";
import { SearchResultItem } from "@/lib/api";

export default function AlbumCard({
  album,
  onSave,
  saved,
  saving,
}: {
  album: SearchResultItem;
  onSave: () => void;
  saved: boolean;
  saving: boolean;
}) {
  const year = album.releaseDate ? album.releaseDate.slice(0, 4) : "—";

  return (
    <div className="group bg-crate-card border border-crate-line rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-crate-bg-raised">
        {album.artworkUrl ? (
          <Image
            src={album.artworkUrl.replace("100x100", "300x300")}
            alt={`${album.title} artwork`}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-crate-ink-muted text-sm">
            No artwork
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-medium text-sm text-crate-ink line-clamp-2">
          {album.title}
        </p>
        <p className="text-xs text-crate-ink-muted line-clamp-1">
          {album.artistName}
        </p>
        <p className="text-xs text-crate-ink-muted font-mono">
          {year} · {album.genre ?? "Unknown genre"} · {album.trackCount ?? "?"} tracks
        </p>
        <button
          onClick={onSave}
          disabled={saved || saving}
          className={`mt-2 text-sm rounded-full py-1.5 font-medium transition-colors ${
            saved
              ? "bg-crate-line text-crate-ink-muted cursor-default"
              : "bg-crate-accent text-crate-accent-ink hover:opacity-90"
          }`}
        >
          {saved ? "Saved ✓" : saving ? "Saving…" : "Save to library"}
        </button>
      </div>
    </div>
  );
}
