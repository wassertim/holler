import type { FC, PropsWithChildren } from 'hono/jsx'

type LayoutProps = PropsWithChildren<{
  title?: string
  includeTurnstile?: boolean
}>

export const Layout: FC<LayoutProps> = ({ title, includeTurnstile, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title ? `${title} - Holler` : 'Holler'}</title>
        <link rel="stylesheet" href="/styles.css" />
        <script src="https://unpkg.com/htmx.org@2.0.4" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous"></script>
        <style dangerouslySetInnerHTML={{ __html: '.js-enabled .noscript-submit { display: none; }' }} />
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js-enabled");' }} />
        {includeTurnstile && (
          <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        )}
      </head>
      <body>
        <header>
          <a href="/">
            <h1>Holler</h1>
          </a>
          <p>Share your feedback and feature requests</p>
        </header>
        <main>
          {children}
        </main>
        <footer>
          <p>Powered by <a href="https://github.com/wassertim/holler">Holler</a></p>
        </footer>
      </body>
    </html>
  )
}
