"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return null;

  return (
    <header className="border-b border-crate-line bg-crate-bg-raised sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link
          href={user ? "/library" : "/login"}
          className="font-display italic text-2xl tracking-tight text-crate-ink"
        >
          Crate<span className="text-crate-accent">.</span>
        </Link>

        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 text-sm rounded-full transition-colors ${
                    active
                      ? "bg-crate-accent text-crate-accent-ink font-medium"
                      : "text-crate-ink-muted hover:text-crate-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden md:inline text-sm text-crate-ink-muted font-mono">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="text-sm px-3.5 py-2 rounded-full border border-crate-line text-crate-ink-muted hover:text-crate-ink hover:border-crate-ink-muted transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="text-sm px-3.5 py-2 rounded-full text-crate-ink-muted hover:text-crate-ink"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm px-3.5 py-2 rounded-full bg-crate-accent text-crate-accent-ink font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
      {user && (
        <nav className="sm:hidden flex justify-around border-t border-crate-line">
          {links.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex-1 text-center py-2.5 text-sm ${
                  active ? "text-crate-accent font-medium" : "text-crate-ink-muted"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
