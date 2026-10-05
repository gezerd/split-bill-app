// Pure split model (ADR 0001: a Share is a weight). No React, no API calls.
// Items { id, name, price, quantity }, people { id, name },
// assignments { item_id, person_id, share_count }. Money is integer cents.

const toCents = (dollars) => Math.round(parseFloat(dollars) * 100);
const qtyOf = (item) => item.quantity || 1;
const itemTotalCents = (item) => toCents(item.price) * qtyOf(item);
const fmt = (cents) => `$${(cents / 100).toFixed(2)}`;

// personId -> shares, for people still on the bill, in people order.
function holdersOf(item, people, assignments) {
  const onItem = assignments.filter((a) => a.item_id === item.id && a.share_count > 0);
  return people
    .map((p) => ({ person: p, shares: onItem.find((a) => a.person_id === p.id)?.share_count || 0 }))
    .filter((h) => h.shares > 0);
}

export function itemStatus(item, assignments) {
  const total = assignments
    .filter((a) => a.item_id === item.id)
    .reduce((sum, a) => sum + (a.share_count || 0), 0);
  if (total === 0) return 'unassigned';
  return total < qtyOf(item) ? 'partial' : 'full';
}

// Item total split by Share weight; largest remainder, ties in people order.
export function splitItemCents(item, people, assignments) {
  const holders = holdersOf(item, people, assignments);
  const totalShares = holders.reduce((sum, h) => sum + h.shares, 0);
  if (!totalShares) return {};
  const total = itemTotalCents(item);
  const raw = holders.map((h) => (total * h.shares) / totalShares);
  const out = raw.map(Math.floor);
  let remaining = total - out.reduce((a, b) => a + b, 0);
  const order = raw
    .map((_, i) => i)
    .sort((a, b) => raw[b] - out[b] - (raw[a] - out[a]) || a - b);
  for (const i of order) {
    if (remaining <= 0) break;
    out[i]++;
    remaining--;
  }
  return Object.fromEntries(holders.map((h, i) => [h.person.id, out[i]]));
}

const firstName = (p) => p.name.trim().split(/\s+/)[0];

function joinNames(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export function describeItem(item, people, assignments) {
  const status = itemStatus(item, assignments);
  if (status === 'unassigned') return { tone: 'dim', text: 'Tap a person to assign' };

  const holders = holdersOf(item, people, assignments);
  const qty = qtyOf(item);
  const claimed = assignments
    .filter((a) => a.item_id === item.id)
    .reduce((sum, a) => sum + (a.share_count || 0), 0);
  const split = splitItemCents(item, people, assignments);
  const even = holders.every((h) => h.shares === holders[0].shares);
  const names = joinNames(holders.map((h) => firstName(h.person)));
  const amounts = holders.map((h) => `${firstName(h.person)} ${fmt(split[h.person.id])}`).join(' · ');

  if (status === 'partial') {
    const who =
      holders.length === 1 ? `${names} covers all ${qty}`
      : even ? `${names} split all ${qty} evenly`
      : `${amounts} for all ${qty}`;
    return { tone: 'warn', text: `${claimed} of ${qty} claimed — ${who}` };
  }
  if (holders.length === 1) return { tone: 'ok', text: `${names} pays` };
  if (even) {
    return { tone: 'ok', text: `Split ${holders.length} ways · ~${fmt(split[holders[0].person.id])} each` };
  }
  return { tone: 'ok', text: amounts };
}

export function summarize({ items, people, assignments, receiptSubtotal }) {
  const itemsSubtotalCents = items.reduce((sum, i) => sum + itemTotalCents(i), 0);
  const itemCount = Object.fromEntries(people.map((p) => [p.id, 0]));
  for (const item of items) {
    for (const pid of Object.keys(splitItemCents(item, people, assignments))) itemCount[pid]++;
  }
  const unassignedItems = items.filter((i) => itemStatus(i, assignments) === 'unassigned');
  const partialItems = items.filter((i) => itemStatus(i, assignments) === 'partial');
  const unassignedPeople = people.filter((p) => itemCount[p.id] === 0);
  const receiptCents = parseFloat(receiptSubtotal) > 0 ? toCents(receiptSubtotal) : null;
  return {
    itemsSubtotalCents,
    receiptCents,
    mismatch: receiptCents != null && receiptCents !== itemsSubtotalCents,
    itemCount,
    unassignedItems,
    partialItems,
    unassignedPeople,
    canProceed: people.length > 0 && items.length > 0 && unassignedItems.length === 0,
  };
}
