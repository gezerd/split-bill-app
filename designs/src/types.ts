// ─────────────────────────────────────────────────────────────────────────
// Split Bill — shared types
// ─────────────────────────────────────────────────────────────────────────

export interface Item {
  id: number;
  name: string;
  price: number;        // per-unit price
  quantity: number;     // units on the receipt
  modifiers: string[];  // e.g. ["Protein Style"]
}

export interface Person {
  id: number;
  name: string;
}

/**
 * Nested map describing how each item is divided.
 *   assignments[itemId][personId] = number of shares that person takes.
 * A person absent from an item's inner map takes 0 shares.
 * An item's cost is split in proportion to share counts (not evenly).
 */
export type Assignments = Record<number, Record<number, number>>;

export type AssignStyle = 'inline' | 'modal';
export type InlineMode = 'cycle' | 'stepper';
export type BreakdownStyle = 'cards' | 'receipt';
export type AccentName = 'mint' | 'gold' | 'coral' | 'cyan';
export type TextContrast = 'subtle' | 'balanced' | 'bright';

/** Per-person settlement produced by calcBreakdown(). */
export interface PersonBreakdown {
  person: Person;
  colorIndex: number;
  items: { name: string; amount: number; myShares: number; totalShares: number }[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}
