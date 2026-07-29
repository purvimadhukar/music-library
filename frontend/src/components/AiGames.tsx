"use client";

import { useState } from "react";
import {
  getGuessAlbumChallenge,
  getEmojiChallenge,
  GuessAlbumChallenge,
  EmojiChallenge,
} from "@/lib/api";

function errorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const message = (err as { response?: { data?: { message?: string } } }).response
      ?.data?.message;
    if (message) return message;
  }
  return "Something went wrong — try again.";
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ");
}

const HURRAHS = [
  "Hurrah! 🎉 Nailed it.",
  "Yes! You've got great taste (and a great ear). 🙌",
  "Correct! That one didn't stand a chance. 🎯",
  "Boom! Straight to the top of the leaderboard. 🌟",
];

function GuessInput({
  correctTitle,
  onResult,
}: {
  correctTitle: string;
  onResult: (correct: boolean) => void;
}) {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [hurrah, setHurrah] = useState("");

  function check() {
    const isCorrect = normalize(guess) === normalize(correctTitle) && guess.trim() !== "";
    if (isCorrect) {
      setHurrah(HURRAHS[Math.floor(Math.random() * HURRAHS.length)]);
    }
    setResult(isCorrect ? "correct" : "wrong");
    onResult(isCorrect);
  }

  if (result === "correct") {
    return (
      <div className="bg-crate-bg-raised rounded-lg p-3">
        <p className="text-sm font-medium text-crate-accent">{hurrah}</p>
      </div>
    );
  }

  if (result === "wrong") {
    return (
      <div className="bg-crate-bg-raised rounded-lg p-3">
        <p className="text-sm text-crate-ink-muted">
          Oops, that&apos;s okay! It was{" "}
          <span className="text-crate-ink font-medium">{correctTitle}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && check()}
        placeholder="Type your guess…"
        className="flex-1 bg-crate-bg-raised border border-crate-line rounded-full px-4 py-1.5 text-sm outline-none focus:border-crate-accent"
      />
      <button
        onClick={check}
        className="text-sm px-4 py-1.5 rounded-full bg-crate-accent text-crate-accent-ink font-medium"
      >
        Check
      </button>
    </div>
  );
}

function PointsBadge({ points }: { points: number }) {
  return (
    <p className="text-xs text-crate-ink-muted">
      🎟️ <span className="text-crate-accent font-medium">{points}</span> point
      {points === 1 ? "" : "s"} toward a free concert ticket
    </p>
  );
}

export function GuessAlbumGame() {
  const [challenge, setChallenge] = useState<GuessAlbumChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [round, setRound] = useState(0);

  async function newRound() {
    setLoading(true);
    setError(null);
    try {
      setChallenge(await getGuessAlbumChallenge());
      setRound((r) => r + 1);
    } catch (err) {
      setError(errorMessage(err));
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-crate-card border border-crate-line rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-crate-ink">🎵 Guess the Album</p>
        <button
          onClick={newRound}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-full border border-crate-line text-crate-ink-muted hover:text-crate-ink"
        >
          {loading ? "Shuffling…" : challenge ? "New round" : "Play"}
        </button>
      </div>

      {points > 0 && <div className="mb-2"><PointsBadge points={points} /></div>}

      {error && <p className="text-sm text-crate-red">{error}</p>}

      {!challenge && !error && (
        <p className="text-sm text-crate-ink-muted">
          Get clues from a random album in your library and type your guess.
        </p>
      )}

      {challenge && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-crate-ink-muted">
            🎤 Artist: <span className="text-crate-ink">{challenge.artistName}</span>
          </p>
          <p className="text-sm text-crate-ink-muted">
            🎸 Genre: <span className="text-crate-ink">{challenge.genre ?? "Unknown"}</span>
          </p>
          <p className="text-sm text-crate-ink-muted">
            📅 Released:{" "}
            <span className="text-crate-ink">{challenge.releaseYear ?? "Unknown"}</span>
          </p>
          <p className="text-sm text-crate-ink-muted">
            💿 Tracks: <span className="text-crate-ink">{challenge.trackCount ?? "?"}</span>
          </p>

          <div className="mt-1">
            <GuessInput
              key={round}
              correctTitle={challenge.correctTitle}
              onResult={(correct) => correct && setPoints((p) => p + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function EmojiChallengeGame() {
  const [challenge, setChallenge] = useState<EmojiChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [round, setRound] = useState(0);

  async function newRound() {
    setLoading(true);
    setError(null);
    try {
      setChallenge(await getEmojiChallenge());
      setRound((r) => r + 1);
    } catch (err) {
      setError(errorMessage(err));
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-crate-card border border-crate-line rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-crate-ink">🧩 Emoji Challenge</p>
        <button
          onClick={newRound}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-full border border-crate-line text-crate-ink-muted hover:text-crate-ink"
        >
          {loading ? "Shuffling…" : challenge ? "New round" : "Play"}
        </button>
      </div>

      {points > 0 && <div className="mb-2"><PointsBadge points={points} /></div>}

      {error && <p className="text-sm text-crate-red">{error}</p>}

      {!challenge && !error && (
        <p className="text-sm text-crate-ink-muted">
          An album title from your library, translated into emoji. Type your guess.
        </p>
      )}

      {challenge && (
        <div className="flex flex-col gap-3">
          <p className="text-4xl tracking-wide">{challenge.emoji}</p>
          <p className="text-xs text-crate-ink-muted">
            by <span className="text-crate-ink">{challenge.artistName}</span>
          </p>

          <GuessInput
            key={round}
            correctTitle={challenge.correctTitle}
            onResult={(correct) => correct && setPoints((p) => p + 1)}
          />
        </div>
      )}
    </div>
  );
}
