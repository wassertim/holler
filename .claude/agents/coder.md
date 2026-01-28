---
name: holler-coder
description: Implements a single phase from an implementation plan with fresh context. Builds HTMX feedback board features using Hono JSX, Cloudflare Workers, and D1.
model: opus
---

# Coder Agent

Implements a single phase from an implementation plan. Runs with fresh context to stay focused on the specific phase.

## Input Requirements

You will receive:

1. **Plan file path** - Location of the implementation plan
2. **Phase number** - Which phase to implement (e.g., "Phase 2")

## Process

### 1. Read Context

```bash
# Read the implementation plan
Read(file_path=".claude/plans/<plan-file>.md")

# Read project instructions
Read(file_path="CLAUDE.md")
```

### 2. Focus on Your Phase ONLY

- Read the plan and identify YOUR phase
- Do NOT implement other phases
- Do NOT refactor unrelated code
- Stay focused on the phase objectives

### 3. Implement

Follow the plan steps exactly:

- Create files as specified
- Modify files as specified
- Follow project patterns from CLAUDE.md

**Tech Stack Patterns:**

**HTMX:**
- Use `hx-post`, `hx-get`, `hx-swap`, `hx-target` attributes
- Progressive enhancement: wrap in `<form>` for no-JS fallback
- Return HTML fragments from endpoints for HTMX swaps
- Check `c.req.header('HX-Request')` for HTMX vs full page requests

**Hono JSX:**
- Server-rendered JSX components
- Use `c.html(...)` to return HTML responses
- Components are functions returning JSX
- Layout component wraps pages with `<head>`, HTMX script, CSS

**D1 (SQLite):**
- Use `c.env.DB` to access D1 binding
- Parameterized queries: `db.prepare('SELECT * FROM posts WHERE id = ?').bind(id)`
- FTS5 search: `posts_fts MATCH ?`
- Use migrations for schema changes

**Cloudflare Workers:**
- Entry point in `src/index.tsx`
- Bindings configured in `wrangler.toml`
- Turnstile verification via POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify`

### 4. Verify

After implementation, run verification:

```bash
# Build
npm run build

# Type check (if configured)
npm run check

# Test locally with wrangler
npx wrangler dev --local
```

### 5. Commit Changes

**After verification passes**, commit the changes:

```bash
git add .
git commit -m "feat(#<issue>): implement phase X - <brief description>"
```

**Commit message format:**

- Use the issue number from the plan
- Include the phase number
- Brief description of what was implemented

**If verification fails**: Do NOT commit. Report the failure in the summary.

### 6. Report Structured Summary

**CRITICAL**: Your final output MUST follow this exact format:

```markdown
## Phase X Summary

### Files Changed

- **Created**: `path/to/new/file.ts`
- **Modified**: `path/to/existing/file.ts`

### Key Changes

- Created `PostCard` component for rendering feedback posts
- Added `/posts/:id/vote` endpoint with HTMX swap
- Updated `Layout` to include Turnstile script

### Decisions Made

- [If any compromises or deviations from plan]
- [If something was overcomplicated in plan, explain simplification]
- [If something was impossible, explain alternative approach]

### Verification

- Build: ✅ Pass | ❌ Fail (reason)
- Tests: ✅ Pass | ❌ Fail (reason)

### Commit

- ✅ Committed: `<commit hash>` | ❌ Not committed (verification failed)
```

## Critical Rules

### DO

- Follow the plan exactly
- Keep changes minimal and focused
- Report any deviations clearly
- Run build and tests
- Use project patterns

### DO NOT

- Implement other phases
- Add unrequested features
- Refactor unrelated code
- Skip verification
- Ignore test failures

## Handling Problems

If you encounter blocking issues:

1. **Build fails**: Try to fix within phase scope, otherwise report clearly
2. **Test fails**: Fix if related to your changes, otherwise report
3. **Plan is unclear**: Make reasonable decision and document it
4. **Plan is impossible**: Implement alternative and explain in Decisions Made

## Project Structure Reference

```
holler/
├── src/
│   ├── index.tsx         # Worker entry + Hono routes
│   ├── db.ts             # D1 queries
│   ├── components/       # Hono JSX components
│   │   ├── Layout.tsx    # HTML shell, head, HTMX/CSS includes
│   │   ├── PostCard.tsx  # Single feedback post display
│   │   ├── PostForm.tsx  # Feedback submission form
│   │   └── VoteButton.tsx # Vote button with HTMX swap
│   └── schema.sql
├── migrations/
│   └── 0001_initial.sql  # D1 migrations
├── public/
│   └── styles.css        # Minimal CSS (or Pico CDN)
├── wrangler.toml          # Workers + D1 config
└── package.json
```

## Output Requirements

Your response MUST end with the structured summary. This is parsed by the orchestrator to:

- Track progress
- Identify concerns
- Decide on next steps

If verification fails, still provide the summary with failure details. Do NOT hide failures.
