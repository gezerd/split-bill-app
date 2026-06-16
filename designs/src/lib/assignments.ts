// ─────────────────────────────────────────────────────────────────────────
// Split Bill — assignment math
//
// `assignments` shape: { [itemId]: { [personId]: shareCount } }
// Each item's cost (price × quantity) is divided in proportion to share
// counts. Tax and tip are then split across people in proportion to each
// person's subtotal share of the whole bill.
// ─────────────────────────────────────────────────────────────────────────
import type { Assignments, Item, Person, PersonBreakdown } from '../types';

export const shareCount = (a: Assignments, itemId: number, pid: number): number =>
  a[itemId]?.[pid] || 0;

export const totalShares = (a: Assignments, itemId: number): number =>
  Object.values(a[itemId] || {}).reduce((s, v) => s + v, 0);

export const assignedPids = (a: Assignments, itemId: number): number[] =>
  Object.keys(a[itemId] || {}).map(Number);

/** Immutably set (or clear, when count ≤ 0) one person's share of one item. */
export function setShare(a: Assignments, itemId: number, pid: number, count: number): Assignments {
  const next: Assignments = { ...a };
  const itemMap = { ...(next[itemId] || {}) };
  if (count <= 0) delete itemMap[pid];
  else itemMap[pid] = count;
  if (Object.keys(itemMap).length === 0) delete next[itemId];
  else next[itemId] = itemMap;
  return next;
}

/** Per-person settlement, including proportional tax & tip. */
export function calcBreakdown(
  items: Item[],
  people: Person[],
  assignments: Assignments,
  tax: number,
  tip: number,
): PersonBreakdown[] {
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return people.map((person, i) => {
    const myItems = items.flatMap(it => {
      const map = assignments[it.id] || {};
      const myShares = map[person.id] || 0;
      if (myShares <= 0) return [];
      const total = Object.values(map).reduce((s, v) => s + v, 0);
      const itemTotal = it.price * it.quantity;
      return [{ name: it.name, amount: (itemTotal * myShares) / total, myShares, totalShares: total }];
    });

    const sub = myItems.reduce((s, x) => s + x.amount, 0);
    const ratio = subtotal > 0 ? sub / subtotal : 0;

    return {
      person,
      colorIndex: i,
      items: myItems,
      subtotal: sub,
      tax: tax * ratio,
      tip: tip * ratio,
      total: sub + tax * ratio + tip * ratio,
    };
  });
}
