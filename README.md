# Holler

Lightweight, open-source feedback board. HTMX + Cloudflare Workers + D1. Deploy in one click.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/wassertim/holler)

## Features

- **Feedback posts** with titles, descriptions, and optional email
- **Voting** -- one vote per visitor, tracked via cookie
- **Full-text search** powered by SQLite FTS5
- **Status tracking** -- open, planned, in progress, done, closed
- **Admin controls** -- update status and delete posts via token auth
- **Spam prevention** -- Cloudflare Turnstile integration
- **Progressive enhancement** -- works without JavaScript

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTMX + minimal CSS |
| Templating | Hono JSX (server-rendered) |
| API | Cloudflare Workers + Hono |
| Database | D1 (SQLite) + FTS5 |
| Spam prevention | Cloudflare Turnstile |
| Admin auth | Simple token |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)

### Local Development

```bash
git clone https://github.com/wassertim/holler.git
cd holler
npm install
npx wrangler d1 migrations apply holler-db --local
npm run dev
```

This starts a local server at `http://localhost:8787` with a local D1 database. You must apply migrations manually before the first run.

Turnstile verification is **skipped** when `TURNSTILE_SECRET` is not configured, so local development works without any setup.

### Admin Access (Local)

Create a `.dev.vars` file in the project root:

```
ADMIN_TOKEN=test123
```

Then visit `http://localhost:8787/?token=test123` to see admin controls (status dropdown, delete button) on each post.

## Deploy to Cloudflare

### 1. Create a D1 Database

```bash
npx wrangler d1 create holler-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "holler-db"
database_id = "your-database-id-here"
migrations_dir = "migrations"
```

### 2. Apply Migrations

```bash
npx wrangler d1 migrations apply holler-db --remote
```

### 3. Set Up Turnstile

Turnstile is Cloudflare's free, privacy-friendly CAPTCHA alternative. It protects the feedback form from spam.

#### Create a Turnstile Widget

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com/) and navigate to **Turnstile**
2. Select **Add widget**
3. Enter a **widget name** (e.g., "Holler Feedback")
4. Under **Hostname management**, add the domain(s) where Holler will be deployed
5. Choose a **widget mode**:
   - **Managed** (recommended) -- Cloudflare decides if interaction is needed
   - **Non-Interactive** -- no visitor interaction, challenge runs in background
   - **Invisible** -- no visible widget at all
6. Click **Create**
7. Copy your **site key** and **secret key**

#### Configure the Keys

```bash
# Set the site key (public, stored as plaintext)
npx wrangler secret put TURNSTILE_SITE_KEY
# Paste your site key when prompted

# Set the secret key (private, encrypted at rest)
npx wrangler secret put TURNSTILE_SECRET
# Paste your secret key when prompted
```

The site key is embedded in the HTML form to render the widget. The secret key is used server-side to verify tokens via the [Turnstile siteverify API](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

### 4. Set Up Admin Auth

```bash
npx wrangler secret put ADMIN_TOKEN
# Enter a secure token when prompted
```

Access admin mode by appending `?token=YOUR_TOKEN` to any page URL.

### 5. Deploy

```bash
npm run deploy
```

## Project Structure

```
holler/
├── src/
│   ├── index.tsx          # Worker entry + Hono routes
│   ├── db.ts              # D1 queries + types
│   └── components/
│       ├── Layout.tsx      # HTML shell, HTMX/CSS includes
│       ├── PostCard.tsx    # Feedback post display
│       ├── PostForm.tsx    # Submission form
│       └── VoteButton.tsx  # Vote toggle button
├── migrations/
│   └── 0001_initial.sql   # D1 schema (posts, votes, FTS5)
├── public/
│   └── styles.css         # Minimal custom CSS
├── wrangler.toml
└── package.json
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development with wrangler |
| `npm run build` | Build for production (dry-run) |
| `npm run deploy` | Deploy to Cloudflare Workers |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TURNSTILE_SITE_KEY` | No | Turnstile widget public key. Form submits without captcha when unset. |
| `TURNSTILE_SECRET` | No | Turnstile secret key for server-side verification. Verification skipped when unset. |
| `ADMIN_TOKEN` | No | Token for admin access. Admin routes return 503 when unset. |

For local development, put these in a `.dev.vars` file. For production, use `npx wrangler secret put <NAME>`.

## License

MIT
