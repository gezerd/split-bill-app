/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────────
// Split Bill — Tailwind token config
//
// Colors are wired to CSS variables (see styles/globals.css) so the accent
// and secondary-text themes can be swapped AT RUNTIME by setting the vars on
// :root. The semantic names below avoid Tailwind's built-in `text-*` collision:
//
//   canvas      → --bg            (page background, deep navy)
//   surface     → --surface       (card / panel)
//   surface-hi  → --surface-hi    (elevated / inset)
//   line        → --border        (borders, dividers)
//   accent      → --accent        (primary brand — CTAs, totals)
//   accent-dim  → --accent-dim    (10–15% accent tint)
//   ink         → --text          (primary text)
//   ink-muted   → --text-muted    (secondary text)
//   ink-dim     → --text-dim      (tertiary text)
//
// Usage: bg-canvas, bg-surface, bg-surface-hi, border-line, bg-accent,
//        text-accent, text-ink, text-ink-muted, text-ink-dim
// ─────────────────────────────────────────────────────────────────────────
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          hi: 'var(--surface-hi)',
        },
        line: 'var(--border)',
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // The Step-4 "receipt" breakdown view uses a monospace face.
        mono: ['"Courier New"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fadeUp .3s ease both',
        // springy overshoot used on modals + the upload success check
        'scale-in': 'scaleIn .25s cubic-bezier(.34,1.56,.64,1) both',
        'spin-slow': 'spin .7s linear infinite',
      },
    },
  },
  plugins: [],
};
