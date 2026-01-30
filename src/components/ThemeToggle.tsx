import type { FC } from 'hono/jsx'

type Theme = 'light' | 'dark'

type ThemeToggleProps = {
  currentTheme: Theme
}

export const ThemeToggle: FC<ThemeToggleProps> = ({ currentTheme }) => {
  const isDark = currentTheme === 'dark'
  const nextTheme: Theme = isDark ? 'light' : 'dark'

  return (
    <form
      method="POST"
      action={`/_theme?theme=${nextTheme}`}
      class={`theme-toggle${isDark ? ' is-dark' : ''}`}
      hx-post={`/_theme?theme=${nextTheme}`}
      hx-target=".theme-toggle"
      hx-swap="outerHTML"
    >
      <input type="hidden" name="theme" value={nextTheme} />
      <button
        type="submit"
        class="theme-switch"
        aria-label={`Switch to ${nextTheme} mode`}
      >
        <span class="theme-switch-icon" aria-hidden="true">{'\u2600'}</span>
        <span class="theme-switch-track">
          <span class="theme-switch-knob"></span>
        </span>
        <span class="theme-switch-icon" aria-hidden="true">{'\u263E'}</span>
      </button>
    </form>
  )
}
