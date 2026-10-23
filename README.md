# MVault

> A full-stack personal media tracker for the shows, movies, anime, manga, and books you want to remember.

[Live demo](https://media-vault-snowy.vercel.app/) · [Report an issue](https://github.com/Kaneshiroa/Media-Vault/issues)

## Features

- Create a personal library for live-action, animated, and reading titles.
- Search TMDB for movies and series, with AniList fallback for anime and manga.
- Save posters and backdrop artwork alongside title metadata.
- Track status, notes, ratings in 0.1 increments, and episode or chapter progress.
- Filter and sort a library, view dashboard summaries, continue in-progress titles, and see top-rated entries.
- Open an expanded title detail view with quick progress controls.
- Keep each library private with Supabase Auth, JWT-protected API routes, user-scoped queries, and PostgreSQL Row Level Security.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js, React, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Data and authentication | Supabase Auth, PostgreSQL, Row Level Security |
| External APIs | TMDB, AniList |
| Deployment | Vercel (frontend), Render (API) |

## Architecture

```text
Next.js client ── Supabase Auth ──> Supabase
      │
      └─ Bearer token ──> FastAPI API ──> PostgreSQL (Supabase)
                              │
                              └─ TMDB search → AniList fallback
```

The frontend obtains the signed-in user’s Supabase access token and sends it with API requests. The FastAPI backend verifies the token, scopes media queries to that user, and connects to the Supabase-hosted PostgreSQL database.

## Run locally

### Prerequisites

- Node.js 20+
- Python 3.11+
- A Supabase project with authentication enabled and a PostgreSQL database
- A TMDB API read access token

### 1. Configure the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=your_supabase_postgres_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
FRONTEND_URL=http://localhost:3000
```

Start the API:

```bash
fastapi dev app/main.py
```

The API health check is available at `http://127.0.0.1:8000/start`.

### 2. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Backend | Supabase PostgreSQL connection string |
| `SUPABASE_URL` | Frontend + backend | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Backend | Verifies authenticated sessions with Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Initializes the Supabase client |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Frontend | Initializes the Supabase client |
| `TMDB_READ_ACCESS_TOKEN` | Backend | Authenticates TMDB metadata requests |
| `NEXT_PUBLIC_API_URL` | Frontend | Public base URL of the FastAPI service |
| `FRONTEND_URL` | Backend | Allowed production frontend origin for CORS |

Never commit `.env` or `.env.local` files.

## Deployment

- The Next.js app is deployed on [Vercel](https://vercel.com/).
- The FastAPI service is deployed on [Render](https://render.com/).
- Production services are configured through environment variables; the frontend’s `NEXT_PUBLIC_API_URL` points to the deployed API, and the API’s `FRONTEND_URL` permits the Vercel origin through CORS.

## Credits

This product uses the [TMDB API](https://www.themoviedb.org/) but is not endorsed or certified by TMDB. Poster and backdrop images are provided by TMDB. Anime and manga fallback results are provided by [AniList](https://anilist.co/).
