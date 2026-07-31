# Crate — Personal Album Library

A full-stack app that lets a user search the public iTunes catalog, save albums into
their own library, view analytics on their collection, and get an AI-generated
summary of their listening taste.

**Stack:** Spring Boot 3 (Java 17) · React/Next.js 15 (TypeScript, App Router) · PostgreSQL (H2 for local/demo) · JWT auth

---

## 1. Entity choice: Albums

I chose **Albums** as the focus entity, over Songs or Artists, because:

- Albums have the richest, most analytics-friendly metadata in the iTunes API response
  (`trackCount`, `releaseDate`, `primaryGenreName`, `collectionPrice`) — this maps cleanly
  onto the required charts (releases by year, genre donut, decade bar, etc.) without
  needing extra API calls per item.
- A "library" of albums is a familiar, intuitive product concept (a record shelf /
  digital crate), which made the UI/UX easier to design around a clear narrative.
- Songs would have given weaker analytics (mostly duration + genre), and Artists don't
  carry per-item release/track data at all.

---

## 2. Repo layout

```
music-library/
├── backend/     Spring Boot API (Java 17, Maven)
└── frontend/    Next.js app (TypeScript, Tailwind v4, Recharts)
```

---

## 3. Database & schema

**Choice: relational (PostgreSQL in production, H2 file-mode for local/demo).**
Justification: the data is small, structured, and has clear tabular relationships
(one user → many library items). There's no need for schema flexibility or massive
horizontal scale here, so a relational DB gives us data integrity (unique constraints,
FK-style ownership checks) and simple aggregation queries for analytics with far less
ceremony than a NoSQL store would add.

Only the user's **saved library** is persisted (per the brief — the catalog itself is
never mirrored locally, only fetched live from iTunes on search).

### `users`
| column | type | notes |
|---|---|---|
| id | bigint (PK) | |
| email | varchar, unique | |
| password_hash | varchar | BCrypt |
| display_name | varchar | |
| created_at | timestamp | |

### `library_items`
| column | type | notes |
|---|---|---|
| id | bigint (PK) | |
| user_id | bigint (FK) | ownership; unique with apple_catalog_id (no duplicate saves) |
| apple_catalog_id | bigint | iTunes `collectionId` |
| title | varchar | `collectionName` |
| artist_name | varchar | |
| genre | varchar | `primaryGenreName` |
| release_date | date | |
| track_count | int | |
| artwork_url | varchar | |
| collection_price | double | |
| user_rating | int (1–5, nullable) | user-supplied |
| user_notes | varchar (nullable) | user-supplied |
| created_at / updated_at | timestamp | |

Local/demo mode uses a **file-based H2 database** (zero setup — just run the app), while
the Postgres JDBC driver is included and wired via `DATABASE_URL` / `DATABASE_USERNAME` /
`DATABASE_PASSWORD` for real deployment (Railway/Render Postgres addon, etc.).

---

## 4. REST API

All `/api/library/**` and `/api/analytics/**` and `/api/ai/**` routes require a valid
JWT (`Authorization: Bearer <token>`, obtained via `/api/auth/login` or `/api/auth/register`).

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Returns JWT |
| GET | `/api/search?query=...&type=album&limit=25` | Proxies + normalizes iTunes Search API |
| GET | `/api/library` | List the current user's saved albums |
| POST | `/api/library` | Save an album (from search results) into the library |
| PUT | `/api/library/{id}` | Update `userRating` / `userNotes` |
| DELETE | `/api/library/{id}` | Remove an album from the library |
| GET | `/api/analytics` | Aggregated stats for charts |
| GET | `/api/ai/insights` | (legacy) AI-generated taste/trend summary — no longer used in the UI |
| GET | `/api/ai/games/guess-album` | Random album's clues (artist/genre/year/tracks), title withheld |
| GET | `/api/ai/games/emoji-challenge` | Random album's title translated to emoji, title withheld |

Validation is enforced via Bean Validation annotations on request DTOs; all errors
(validation, not-found, duplicate, auth, upstream iTunes failures) flow through a single
`@RestControllerAdvice` (`GlobalExceptionHandler`) into a consistent JSON error shape.

---

## 5. AI feature: Guess the Album & Emoji Challenge

Two lightweight AI-flavored guessing games, both built entirely from the user's own
saved library rather than a passive summary:

- **`GET /api/ai/games/guess-album`** — picks a random album from your library and
  returns its clues (artist, genre, release year, track count) with the title held
  back. The frontend shows the clues and a text input; typing a correct guess earns a
  celebratory "hurrah" message and a point, a wrong guess gets a gentle reveal
  ("Oops, that's okay! It was _X_.") instead of penalizing you.
- **`GET /api/ai/games/emoji-challenge`** — translates a random saved album's title
  into an emoji sequence (e.g. a title containing "night," "gold," "dream" maps to
  🌙🥇💭) via a word-to-emoji dictionary, again with a type-to-guess input.

Both endpoints throw a clear 404 ("Save at least one album to your library to play")
if the library is empty, handled by the same centralized error handler as the rest of
the API.

Guess checking is forgiving: it lower-cases, trims, and strips punctuation before
comparing, so minor formatting differences don't count against you. A small points
counter ("🎟️ N points toward a free concert ticket") tracks correct guesses per
session as a lighthearted nod to a reward, without needing real backend state for it.

Card generation itself is heuristic/deterministic — no external API calls, so the
games work instantly with zero configuration or cost. (An earlier iteration of this
feature was a passive "trend & taste summary" paragraph generated from the same
analytics numbers, with an optional real Anthropic API call; that logic still exists
in `AiInsightService` but isn't wired into the UI anymore in favor of the games, which
turned out to be more fun to actually use.)

---

## 6. Frontend

- **Search page** — debounced (400ms) live search against `/api/search`, results as an
  album-grid with save state per card.
- **Library page** — full CRUD: star rating, inline notes editing, remove; loading and
  empty states throughout.
- **Analytics dashboard** — 5 charts via Recharts: genre donut, top-artists horizontal
  bar, releases-by-year line chart, rating histogram, and albums-by-decade bar — plus
  the two AI guessing games (Guess the Album, Emoji Challenge).
- Auth is JWT-based, stored in `localStorage`, attached via an axios interceptor; a
  401 response clears the session and redirects to `/login`.

---

## 7. Running locally

### Backend
```bash
cd backend
mvn spring-boot:run
# runs on :8080, using a local file-based H2 DB by default (no setup needed)
```
To point at Postgres instead, set before running:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/musiclib
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=yourpassword
```
Other useful env vars: `JWT_SECRET`, `CORS_ORIGINS`, `AI_PROVIDER`, `ANTHROPIC_API_KEY`.

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL if backend isn't on :8080
npm run dev
# runs on :3000
```
The frontend was built and verified in this environment: `npm run build` and `npm run lint`
both pass cleanly.

---

## 8. Deployment

**Live URLs:**
- Frontend: https://music-library-chi-seven.vercel.app
- Backend API: https://music-library-f81p.onrender.com

Deployed as: **Render** (backend + managed Postgres) + **Vercel** (frontend).

**Backend on Render:**
- Web Service pointed at `backend/` in this repo
- Build command: `mvn clean package -DskipTests`
- Start command: `java -jar target/music-library-1.0.0.jar`
- Managed Render Postgres instance, connected via `DATABASE_URL` / `DATABASE_USERNAME` / `DATABASE_PASSWORD`
- `JWT_SECRET` and `CORS_ORIGINS` (set to the Vercel frontend URL above) configured as environment variables

**Frontend on Vercel:**
- Project root set to `frontend/`
- `NEXT_PUBLIC_API_BASE_URL` environment variable set to the Render backend URL above

Note: Render's free tier spins down services after inactivity, so the backend may take
30-60 seconds to respond to the first request after a period of no traffic — this is
expected free-tier behavior, not a bug.

---

## 9. Trade-offs & what's not done

Given the 3-day scope, priority went to a correct, coherent core over exhaustive polish:

- **No automated tests yet** (would add JUnit + MockMvc for controllers, and a couple of
  service-layer unit tests for `AnalyticsService`/`AiInsightService` next).
- **Pagination** isn't implemented on `/api/library` — acceptable for a personal library
  of the size this app targets, but would matter at scale.
- **iTunes caching** is a simple in-memory 5-minute TTL map, fine for a demo/single
  instance; a real deployment would want Redis or Caffeine with proper eviction.
- **Rate limiting** isn't implemented on the search endpoint.
- **AI feature** ships as two guessing games with zero configuration or API cost by
  design (heuristic clue selection and emoji mapping, no external calls). A passive
  "trend & taste summary" (optionally backed by a real Anthropic API call) was the
  first iteration and its service code is still in the repo, but the games were more
  engaging to actually use, so they replaced it as the primary feature.
- Points in the games reset per session (no backend persistence) — a reasonable scope
  cut for a 3-day project; a real leaderboard would need a `scores` table.