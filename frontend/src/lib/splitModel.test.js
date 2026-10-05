import { describe, it, expect } from 'vitest';
import { itemStatus, splitItemCents, describeItem, summarize } from './splitModel';

const alex = { id: 'a', name: 'Alex Smith' };
const sam = { id: 's', name: 'Sam' };
const jo = { id: 'j', name: 'Jo' };
const people = [alex, sam, jo];
const item = (over) => ({ id: 'i1', name: 'Dish', price: 3, quantity: 1, ...over });
const sh = (personId, n, itemId = 'i1') => ({ item_id: itemId, person_id: personId, share_count: n });

describe('itemStatus', () => {
  it('is unassigned, partial or full from Shares vs quantity', () => {
    const it3 = item({ quantity: 3 });
    expect(itemStatus(it3, [])).toBe('unassigned');
    expect(itemStatus(it3, [sh('a', 1)])).toBe('partial');
    expect(itemStatus(it3, [sh('a', 2), sh('s', 1)])).toBe('full');
    expect(itemStatus(item(), [sh('a', 1)])).toBe('full');
  });
});

describe('splitItemCents', () => {
  it('splits evenly three ways', () => {
    expect(splitItemCents(item({ price: 3 }), people, [sh('a', 1), sh('s', 1), sh('j', 1)]))
      .toEqual({ a: 100, s: 100, j: 100 });
  });
  it('gives $4.25 three ways as 1.42 / 1.42 / 1.41', () => {
    expect(splitItemCents(item({ price: 4.25 }), people, [sh('a', 1), sh('s', 1), sh('j', 1)]))
      .toEqual({ a: 142, s: 142, j: 141 });
  });
  it('weights 2:1', () => {
    expect(splitItemCents(item({ price: 3 }), people, [sh('a', 2), sh('s', 1)]))
      .toEqual({ a: 200, s: 100 });
  });
  it('covers a partial item in full', () => {
    expect(splitItemCents(item({ price: 5, quantity: 3 }), people, [sh('a', 1)])).toEqual({ a: 1500 });
  });
  it('ignores holders no longer on the bill', () => {
    expect(splitItemCents(item({ price: 4 }), [alex], [sh('a', 1), sh('gone', 3)])).toEqual({ a: 400 });
  });
});

describe('describeItem', () => {
  const d = (it, a, p = people) => describeItem(it, p, a);
  it('unassigned', () => {
    expect(d(item(), [])).toEqual({ tone: 'dim', text: 'Tap a person to assign' });
  });
  it('partial: one holder', () => {
    expect(d(item({ quantity: 3 }), [sh('s', 1)]))
      .toEqual({ tone: 'warn', text: '1 of 3 claimed — Sam covers all 3' });
  });
  it('partial: even holders', () => {
    expect(d(item({ quantity: 3, price: 1 }), [sh('a', 1), sh('s', 1)]))
      .toEqual({ tone: 'warn', text: '2 of 3 claimed — Alex & Sam split all 3 evenly' });
  });
  it('partial: uneven holders use amounts', () => {
    expect(d(item({ quantity: 4, price: 1 }), [sh('a', 2), sh('s', 1)]).text)
      .toBe('3 of 4 claimed — Alex $2.67 · Sam $1.33 for all 4');
  });
  it('full: single holder', () => {
    expect(d(item(), [sh('s', 1)])).toEqual({ tone: 'ok', text: 'Sam pays' });
  });
  it('full: even split', () => {
    expect(d(item({ price: 4.25 }), [sh('a', 1), sh('s', 1), sh('j', 1)]))
      .toEqual({ tone: 'ok', text: 'Split 3 ways · ~$1.42 each' });
  });
  it('full: uneven split', () => {
    expect(d(item({ price: 7.05 }), [sh('a', 2), sh('s', 1)]))
      .toEqual({ tone: 'ok', text: 'Alex $4.70 · Sam $2.35' });
  });
});

describe('summarize', () => {
  const items = [item({ id: 'i1', price: 3 }), item({ id: 'i2', price: 2, quantity: 2 })];
  const base = { items, people: [alex, sam], assignments: [], receiptSubtotal: 0 };

  it('blocks on unassigned items and on no people', () => {
    expect(summarize(base).canProceed).toBe(false);
    expect(summarize({ ...base, assignments: [sh('a', 1, 'i1')] }).unassignedItems).toHaveLength(1);
    expect(summarize({ ...base, people: [], assignments: [] }).canProceed).toBe(false);
  });
  it('does not block on partial items or unassigned people', () => {
    const r = summarize({ ...base, assignments: [sh('a', 1, 'i1'), sh('a', 1, 'i2')] });
    expect(r.partialItems).toHaveLength(1);
    expect(r.unassignedPeople).toEqual([sam]);
    expect(r.canProceed).toBe(true);
    expect(r.itemCount).toEqual({ a: 2, s: 0 });
  });
  it('checks mismatch only with a receipt subtotal', () => {
    expect(summarize({ ...base, receiptSubtotal: 0 }).mismatch).toBe(false);
    expect(summarize({ ...base, receiptSubtotal: 10 })).toMatchObject({ mismatch: true, receiptCents: 1000, itemsSubtotalCents: 700 });
    expect(summarize({ ...base, receiptSubtotal: 7 }).mismatch).toBe(false);
  });
});
