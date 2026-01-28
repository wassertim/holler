import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { Layout } from './components/Layout'
import { PostCard } from './components/PostCard'
import { PostForm } from './components/PostForm'
import { VoteButton } from './components/VoteButton'
import { listPosts, createPost, toggleVote, getVotedPostIds } from './db'

type Bindings = {
  DB: D1Database
  TURNSTILE_SECRET: string
  TURNSTILE_SITE_KEY: string
  ADMIN_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

async function verifyTurnstile(secret: string, token: string, remoteIp?: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret,
      response: token,
      remoteip: remoteIp,
    }),
  })
  const result = await response.json<{ success: boolean }>()
  return result.success
}

function getVisitorId(c: any): string {
  let id = getCookie(c, 'visitor_id')
  if (!id) {
    id = crypto.randomUUID()
    setCookie(c, 'visitor_id', id, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return id
}

// Home page - list posts
app.get('/', async (c) => {
  const status = c.req.query('status')
  const sort = c.req.query('sort') as 'votes' | 'newest' | 'oldest' | undefined
  const search = c.req.query('q')
  const visitorId = getVisitorId(c)

  const posts = await listPosts(c.env.DB, { status, sort, search })

  // Batch check which posts this visitor has voted on
  const votedSet = await getVotedPostIds(
    c.env.DB,
    posts.map((p) => p.id),
    visitorId
  )

  const postListHtml = (
    <div id="post-list">
      {posts.length === 0 ? (
        <p class="empty-state">No feedback yet. Be the first to share!</p>
      ) : (
        posts.map((post) => (
          <PostCard post={post} voted={votedSet.has(post.id)} />
        ))
      )}
    </div>
  )

  // HTMX request: return fragment only
  if (c.req.header('HX-Request')) {
    return c.html(postListHtml)
  }

  // Full page request
  return c.html(
    <Layout includeTurnstile={!!c.env.TURNSTILE_SITE_KEY}>
      <PostForm turnstileSiteKey={c.env.TURNSTILE_SITE_KEY} />

      <section class="controls">
        <input
          type="search"
          name="q"
          placeholder="Search feedback..."
          hx-get="/"
          hx-trigger="keyup changed delay:300ms"
          hx-target="#post-list"
          hx-push-url="true"
          value={search || ''}
        />
        <select
          name="sort"
          hx-get="/"
          hx-trigger="change"
          hx-target="#post-list"
          hx-include="[name='q'],[name='status']"
        >
          <option value="votes" selected={sort === 'votes' || !sort}>Top Voted</option>
          <option value="newest" selected={sort === 'newest'}>Newest</option>
          <option value="oldest" selected={sort === 'oldest'}>Oldest</option>
        </select>
        <select
          name="status"
          hx-get="/"
          hx-trigger="change"
          hx-target="#post-list"
          hx-include="[name='q'],[name='sort']"
        >
          <option value="">All Statuses</option>
          <option value="open" selected={status === 'open'}>Open</option>
          <option value="planned" selected={status === 'planned'}>Planned</option>
          <option value="in_progress" selected={status === 'in_progress'}>In Progress</option>
          <option value="done" selected={status === 'done'}>Done</option>
          <option value="closed" selected={status === 'closed'}>Closed</option>
        </select>
      </section>

      {postListHtml}
    </Layout>
  )
})

// Show new post form page (for no-JS navigation)
app.get('/posts/new', (c) => {
  return c.html(
    <Layout title="New Feedback" includeTurnstile={!!c.env.TURNSTILE_SITE_KEY}>
      <PostForm turnstileSiteKey={c.env.TURNSTILE_SITE_KEY} />
    </Layout>
  )
})

// Create post
app.post('/posts', async (c) => {
  const body = await c.req.parseBody()

  // Turnstile verification (skip if not configured, e.g. local dev)
  if (c.env.TURNSTILE_SECRET) {
    const turnstileToken = body['cf-turnstile-response'] as string
    if (!turnstileToken) {
      return c.html(<p class="error">Please complete the captcha verification</p>, 400)
    }
    const ip = c.req.header('CF-Connecting-IP') || ''
    const valid = await verifyTurnstile(c.env.TURNSTILE_SECRET, turnstileToken, ip)
    if (!valid) {
      return c.html(<p class="error">Captcha verification failed. Please try again.</p>, 403)
    }
  }

  const title = (body['title'] as string || '').trim()
  const description = (body['description'] as string || '').trim()
  const email = (body['email'] as string || '').trim()

  // Validate
  if (!title || title.length > 200) {
    return c.html(<p class="error">Title is required (max 200 characters)</p>, 400)
  }

  const post = await createPost(c.env.DB, {
    title,
    description: description || undefined,
    email: email || undefined,
  })

  // HTMX request: return new post card
  if (c.req.header('HX-Request')) {
    return c.html(<PostCard post={post} voted={false} />)
  }

  // No-JS fallback: redirect to home
  return c.redirect('/')
})

// Vote toggle
app.post('/posts/:id/vote', async (c) => {
  const postId = parseInt(c.req.param('id'), 10)
  if (isNaN(postId)) return c.text('Invalid post ID', 400)

  const visitorId = getVisitorId(c)
  const { voted, votes } = await toggleVote(c.env.DB, postId, visitorId)

  // HTMX request: return updated VoteButton fragment
  if (c.req.header('HX-Request')) {
    return c.html(<VoteButton postId={postId} votes={votes} voted={voted} />)
  }

  // No-JS fallback: redirect back
  return c.redirect('/')
})

export default app
