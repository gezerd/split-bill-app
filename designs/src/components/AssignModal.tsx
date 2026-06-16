// AssignModal — full assignment editor opened from an ItemCard in `modal` mode.
// Lets you set each person's share count for one item; shows a live per-person
// "pays $X" preview and a running share total. Clicking the scrim closes it.
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Stepper } from './Stepper';
import { fmt } from '../lib/format';
import type { Assignments, Item, Person } from '../types';

interface AssignModalProps {
  item: Item;
  people: Person[];
  assignments: Assignments;
  onSave: (itemId: number, shareMap: Record<number, number>) => void;
  onClose: () => void;
}

export function AssignModal({ item, people, assignments, onSave, onClose }: AssignModalProps) {
  const [shares, setShares] = useState<Record<number, number>>(() => ({ ...(assignments[item.id] || {}) }));

  const total = Object.values(shares).reduce((s, v) => s + v, 0);
  const totalPaid = item.price * item.quantity;

  const setN = (pid: number, n: number) => {
    const next = { ...shares };
    if (n <= 0) delete next[pid];
    else next[pid] = n;
    setShares(next);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-5"
      style={{ background: 'rgba(0,0,0,.72)' }}
    >
      <div
        className="scale-in w-full max-w-[420px] overflow-hidden rounded-[22px] border border-line bg-surface"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <div className="text-[17px] font-extrabold">{item.name}</div>
            <div className="mt-[3px] text-[13px] text-ink-muted">
              {fmt(totalPaid)} total{item.quantity > 1 ? ` · ${item.quantity} available` : ''}
            </div>
          </div>
          <button onClick={onClose} className="px-0.5 text-2xl leading-none text-ink-muted">
            ×
          </button>
        </div>

        {/* People list */}
        <div className="max-h-[360px] overflow-y-auto px-6 py-4">
          {people.length === 0 ? (
            <p className="py-6 text-center text-ink-muted">Add people first</p>
          ) : (
            people.map((p, i) => {
              const n = shares[p.id] || 0;
              const owes = total > 0 && n > 0 ? (totalPaid * n) / total : 0;
              return (
                <div
                  key={p.id}
                  className="mb-2 flex items-center gap-3 rounded-[14px] px-[14px] py-3 transition-all duration-150"
                  style={{
                    background: n > 0 ? 'var(--accent-dim)' : 'var(--surface-hi)',
                    border: `1.5px solid ${n > 0 ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  <Avatar person={p} index={i} size={36} filled={n > 0} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    {n > 0 && <div className="mt-0.5 text-[11px] text-ink-muted">pays {fmt(owes)}</div>}
                  </div>
                  <Stepper value={n} onChange={v => setN(p.id, v)} />
                </div>
              );
            })
          )}

          {total > 0 && (
            <div className="mt-3 flex justify-between rounded-[10px] bg-surface-hi px-[14px] py-2.5 text-xs text-ink-muted">
              <span>
                {total} share{total !== 1 ? 's' : ''} total
              </span>
              <span>{item.quantity > 1 ? `${item.quantity} items` : 'split'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 border-t border-line px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-surface-hi p-3 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(item.id, shares);
              onClose();
            }}
            className="flex-1 rounded-xl bg-accent p-3 text-sm font-bold text-[#111]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
