"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { EmptyState, LoadingSpinner } from "@/components/States";
import { getAnalytics, AnalyticsResponse } from "@/lib/api";
import { GuessAlbumGame, EmojiChallengeGame } from "@/components/AiGames";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const PALETTE = ["#e8a33d", "#4f8f8c", "#c1543f", "#8f7a4f", "#6b7a8f", "#a3874f"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-crate-card border border-crate-line rounded-xl p-5">
      <p className="text-sm font-medium text-crate-ink mb-4">{title}</p>
      {children}
    </div>
  );
}

function AnalyticsPageInner() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Crunching your library…" />;

  if (!data || data.totalAlbums === 0) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-10">
        <EmptyState
          title="No data yet"
          description="Save a few albums to your library to unlock charts and AI insights."
        />
      </div>
    );
  }

  const decadeData = Object.entries(data.decadeBreakdown)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([decade, count]) => ({ decade, count }));

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-display italic text-3xl mb-1">Analytics</h1>
      <p className="text-crate-ink-muted mb-8 text-sm">
        A statistical portrait of {data.totalAlbums} saved album
        {data.totalAlbums === 1 ? "" : "s"}.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-crate-card border border-crate-line rounded-xl p-4">
          <p className="text-2xl font-display">{data.totalAlbums}</p>
          <p className="text-xs text-crate-ink-muted">Albums saved</p>
        </div>
        <div className="bg-crate-card border border-crate-line rounded-xl p-4">
          <p className="text-2xl font-display">{data.averageRating || "—"}</p>
          <p className="text-xs text-crate-ink-muted">Avg. rating / 5</p>
        </div>
        <div className="bg-crate-card border border-crate-line rounded-xl p-4">
          <p className="text-2xl font-display">{data.averageTrackCount || "—"}</p>
          <p className="text-xs text-crate-ink-muted">Avg. tracks / album</p>
        </div>
        <div className="bg-crate-card border border-crate-line rounded-xl p-4">
          <p className="text-2xl font-display">{data.topArtists[0]?.artist ?? "—"}</p>
          <p className="text-xs text-crate-ink-muted">Top artist</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium text-crate-accent mb-3">✦ AI Games</p>
        <div className="grid md:grid-cols-2 gap-5">
          <GuessAlbumGame />
          <EmojiChallengeGame />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <ChartCard title="Genres (Donut)">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.byGenre}
                dataKey="count"
                nameKey="genre"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.byGenre.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#221d16", border: "1px solid #35301f" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top artists (Horizontal bar)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topArtists} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#35301f" horizontal={false} />
              <XAxis type="number" stroke="#b8ae9c" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="artist" width={110} stroke="#b8ae9c" fontSize={11} />
              <Tooltip contentStyle={{ background: "#221d16", border: "1px solid #35301f" }} />
              <Bar dataKey="count" fill="#e8a33d" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Releases by year (Line)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.releasesByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#35301f" />
              <XAxis dataKey="year" stroke="#b8ae9c" fontSize={12} />
              <YAxis stroke="#b8ae9c" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#221d16", border: "1px solid #35301f" }} />
              <Line type="monotone" dataKey="count" stroke="#4f8f8c" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Your rating distribution (Histogram)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#35301f" />
              <XAxis dataKey="rating" stroke="#b8ae9c" fontSize={12} tickFormatter={(v) => `${v}★`} />
              <YAxis stroke="#b8ae9c" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#221d16", border: "1px solid #35301f" }} />
              <Bar dataKey="count" fill="#c1543f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Albums by decade (Bar)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={decadeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#35301f" />
              <XAxis dataKey="decade" stroke="#b8ae9c" fontSize={12} />
              <YAxis stroke="#b8ae9c" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#221d16", border: "1px solid #35301f" }} />
              <Bar dataKey="count" fill="#8f7a4f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <AnalyticsPageInner />
    </RequireAuth>
  );
}
