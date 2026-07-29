"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, displayName);
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display italic text-3xl mb-1">Start your crate</h1>
      <p className="text-crate-ink-muted mb-8 text-sm">
        Create an account to save albums and track your taste.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Name
          <input
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-crate-card border border-crate-line rounded-lg px-3 py-2.5 outline-none focus:border-crate-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-crate-card border border-crate-line rounded-lg px-3 py-2.5 outline-none focus:border-crate-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-crate-card border border-crate-line rounded-lg px-3 py-2.5 outline-none focus:border-crate-accent"
          />
          <span className="text-xs text-crate-ink-muted">At least 6 characters.</span>
        </label>

        {error && <p className="text-crate-red text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-crate-accent text-crate-accent-ink rounded-full py-2.5 font-medium disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-crate-ink-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-crate-accent">
          Log in
        </Link>
      </p>
    </div>
  );
}
