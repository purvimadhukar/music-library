import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== "undefined" && err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export type SearchResultItem = {
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  artworkUrl: string | null;
  collectionPrice: number | null;
};

export type LibraryItemResponse = {
  id: number;
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string | null;
  releaseDate: string | null;
  trackCount: number | null;
  artworkUrl: string | null;
  collectionPrice: number | null;
  userRating: number | null;
  userNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsResponse = {
  totalAlbums: number;
  averageRating: number;
  averageTrackCount: number;
  byGenre: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  releasesByYear: { year: number; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  decadeBreakdown: Record<string, number>;
};

export async function searchAlbums(query: string, limit = 25) {
  const res = await api.get<SearchResultItem[]>("/api/search", {
    params: { query, type: "album", limit },
  });
  return res.data;
}

export async function getLibrary() {
  const res = await api.get<LibraryItemResponse[]>("/api/library");
  return res.data;
}

export async function addToLibrary(item: SearchResultItem) {
  const res = await api.post<LibraryItemResponse>("/api/library", {
    appleCatalogId: item.appleCatalogId,
    title: item.title,
    artistName: item.artistName,
    genre: item.genre,
    releaseDate: item.releaseDate,
    trackCount: item.trackCount,
    artworkUrl: item.artworkUrl,
    collectionPrice: item.collectionPrice,
  });
  return res.data;
}

export async function updateLibraryItem(
  id: number,
  update: { userRating?: number | null; userNotes?: string | null }
) {
  const res = await api.put<LibraryItemResponse>(
    `/api/library/${id}`,
    update
  );
  return res.data;
}

export async function deleteLibraryItem(id: number) {
  await api.delete(`/api/library/${id}`);
}

export async function getAnalytics() {
  const res = await api.get<AnalyticsResponse>("/api/analytics");
  return res.data;
}

export async function getAiInsights() {
  const res = await api.get<{ summary: string }>("/api/ai/insights");
  return res.data.summary;
}

export type GuessAlbumChallenge = {
  albumId: number;
  artistName: string;
  genre: string | null;
  releaseYear: number | null;
  trackCount: number | null;
  artworkUrl: string | null;
  correctTitle: string;
};

export type EmojiChallenge = {
  albumId: number;
  emoji: string;
  artistName: string;
  artworkUrl: string | null;
  correctTitle: string;
};

export async function getGuessAlbumChallenge() {
  const res = await api.get<GuessAlbumChallenge>("/api/ai/games/guess-album");
  return res.data;
}

export async function getEmojiChallenge() {
  const res = await api.get<EmojiChallenge>("/api/ai/games/emoji-challenge");
  return res.data;
}
