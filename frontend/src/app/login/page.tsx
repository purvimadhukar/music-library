"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError(message || "Couldn't log in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display italic text-3xl mb-1">Welcome back</h1>
      <p className="text-crate-ink-muted mb-8 text-sm">
        Log in to get back to your crate.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-crate-card border border-crate-line rounded-lg px-3 py-2.5 outline-none focus:border-crate-accent"
          />
        </label>

        {error && <p className="text-crate-red text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-crate-accent text-crate-accent-ink rounded-full py-2.5 font-medium disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-crate-ink-muted mt-6">
        New here?{" "}
        <Link href="/register" className="text-crate-accent">
          Create an account
        </Link>
      </p>
    </div>
  );
}
