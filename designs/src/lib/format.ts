// ─────────────────────────────────────────────────────────────────────────
// Split Bill — formatting helpers
// ─────────────────────────────────────────────────────────────────────────

/** "Jane Doe" → "JD"  (max 2 chars, uppercased) */
export const initials = (name: string): string =>
  name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/** 5.4 → "$5.40" */
export const fmt = (n: number): string => `$${parseFloat(String(n || 0)).toFixed(2)}`;
