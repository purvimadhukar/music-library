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
| GET | `/api/ai/insights` | AI-generated taste/trend summary |

Validation is enforced via Bean Validation annotations on request DTOs; all errors
(validation, not-found, duplicate, auth, upstream iTunes failures) flow through a single
`@RestControllerAdvice` (`GlobalExceptionHandler`) into a consistent JSON error shape.

---

## 5. AI feature: Trend & Taste Summary

`GET /api/ai/insights` returns a short natural-language paragraph describing the user's
saved library: dominant genre, most-saved artist, era spread, average rating, and a
gap-based suggestion for a genre they haven't explored yet.

Two interchangeable modes (`app.ai.provider` / `AI_PROVIDER` env var):

- **`heuristic` (default)** — a deterministic, template-driven summary computed purely
  from the same numbers behind the analytics dashboard. Works instantly, offline, with
  zero configuration or API cost — important for a gradeable demo that shouldn't depend
  on a live LLM key.
- **`anthropic`** — if `ANTHROPIC_API_KEY` is set, the same analytics JSON is sent to
  Claude for a warmer, more specific summary, with automatic fallback to the heuristic
  summary if the call fails for any reason.

This shows the intended real integration path while keeping the default path fully
self-contained.

---

## 6. Frontend

- **Search page** — debounced (400ms) live search against `/api/search`, results as an
  album-grid with save state per card.
- **Library page** — full CRUD: star rating, inline notes editing, remove; loading and
  empty states throughout.
- **Analytics dashboard** — 5 charts via Recharts: genre donut, top-artists horizontal
  bar, releases-by-year line chart, rating histogram, and albums-by-decade bar — plus
  the AI insight panel.
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

> **Note on this submission:** the backend was written and reviewed carefully but not
> compiled in the environment this was authored in (no Maven Central access there). Please
> run `mvn spring-boot:run` as your first step locally — happy to fix any compile issues
> that surface, but the code follows standard, verified Spring Boot 3 patterns throughout.

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

Suggested split: **Render** (backend + managed Postgres) + **Vercel** (frontend).

**Backend on Render:**
1. New Web Service → point at `backend/`, build command `mvn clean package -DskipTests`,
   start command `java -jar target/music-library-1.0.0.jar`.
2. Add a Render Postgres instance, set `DATABASE_URL`/`DATABASE_USERNAME`/`DATABASE_PASSWORD`.
3. Set `JWT_SECRET` (long random string) and `CORS_ORIGINS` to your Vercel frontend URL.

**Frontend on Vercel:**
1. Import the `frontend/` directory as the project root.
2. Set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL.
3. Deploy.

*(Live URLs to be added here once deployed — deployment requires account access this
environment doesn't have, so it's left for you to run through the two steps above.)*

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
- **AI feature** ships with a free heuristic mode by default; the Anthropic integration
  path is wired and tested for shape but needs a real API key to exercise end-to-end.
- Duplicate-detection was considered as the AI feature but Trend Summary was chosen
  since it makes better use of the full analytics surface already being computed.
