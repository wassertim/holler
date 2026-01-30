import type { FC } from 'hono/jsx'

type Theme = 'light' | 'dark'

type ThemeToggleProps = {
  currentTheme: Theme
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ currentTheme }) => {
  const isDark = currentTheme === 'dark'
  const nextTheme: Theme = isDark ? 'light' : 'dark'
  // Sun icon when dark (click to go light), moon icon when light (click to go dark)
  const icon = isDark ? '\u2600' : '\u263E'
  const label = isDark ? 'Light' : 'Dark'

  return (
    <form
      method="POST"
      action={`/_theme?theme=${nextTheme}`}
      class="theme-toggle"
      hx-post={`/_theme?theme=${nextTheme}`}
      hx-target=".theme-toggle"
      hx-swap="outerHTML"
    >
      <input type="hidden" name="theme" value={nextTheme} />
      <button
        type="submit"
        class="theme-toggle-btn"
        aria-label={`Switch to ${label.toLowerCase()} mode`}
      >
        <span class="theme-toggle-icon">{icon}</span>
        {label}
      </button>
    </form>
  )
}
