import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
  TURNSTILE_SECRET: string
  ADMIN_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Holler</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <h1>Holler</h1>
          <p>Share your feedback and feature requests</p>
        </header>
        <main>
          <p>Feedback board coming soon.</p>
        </main>
      </body>
    </html>
  )
})

export default app
