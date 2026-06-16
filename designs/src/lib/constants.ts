// ─────────────────────────────────────────────────────────────────────────
// Split Bill — design constants, theme maps & demo data
// ─────────────────────────────────────────────────────────────────────────
import type { AccentName, Item, TextContrast } from '../types';

/** Avatar ring/fill palette — cycled by person index. Not part of the
 *  Tailwind token set because it is data-driven (applied via inline style). */
export const AVATAR_COLORS = [
  '#F87171', // red
  '#60A5FA', // blue
  '#A78BFA', // purple
  '#4ADE80', // green
  '#FBBF24', // amber
  '#F472B6', // pink
  '#FB923C', // orange
  '#38BDF8', // sky
];

export const STEP_LABELS = ['Upload', 'Assign', 'Tax & Tip', 'Done'];

export const TIP_PRESETS = [15, 18, 20, 22, 25]; // %, default 18

/** Runtime accent themes. Written to --accent / --accent-dim on :root. */
export const ACCENTS: Record<AccentName, { color: string; dim: string }> = {
  mint:  { color: 'oklch(76% 0.22 148)', dim: 'oklch(76% 0.22 148 / 0.15)' },
  gold:  { color: 'oklch(78% 0.16 85)',  dim: 'oklch(78% 0.16 85 / 0.15)'  },
  coral: { color: 'oklch(70% 0.18 25)',  dim: 'oklch(70% 0.18 25 / 0.15)'  },
  cyan:  { color: '#00FDDC',             dim: 'oklch(92% 0.14 185 / 0.15)' }, // default (brand)
};

/** Runtime secondary-text themes. Written to --text-muted / --text-dim. */
export const TEXT_CONTRAST: Record<TextContrast, { muted: string; dim: string }> = {
  subtle:   { muted: '#7AAAC4', dim: '#4A7898' },
  balanced: { muted: '#A0C4DC', dim: '#7AAAB8' }, // default
  bright:   { muted: '#C4DCF0', dim: '#9BBAD0' },
};

// ── Demo data (stand-in for the receipt-OCR result) ──────────────────────
export const MOCK_ITEMS: Item[] = [
  { id: 1, name: 'Double Double',      price: 5.45, quantity: 1, modifiers: ['Protein Style'] },
  { id: 2, name: 'Cheeseburger',       price: 3.75, quantity: 2, modifiers: [] },
  { id: 3, name: 'Animal Style Fries', price: 2.95, quantity: 1, modifiers: ['Grilled Onions'] },
  { id: 4, name: 'Strawberry Shake',   price: 3.25, quantity: 1, modifiers: [] },
  { id: 5, name: 'Large Soda',         price: 2.00, quantity: 3, modifiers: [] },
];

export const MOCK_TAX = 1.87;
