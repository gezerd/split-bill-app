// ItemCard — one receipt line item with its assignment UI.
//
// Three assignment UIs, chosen by props:
//   assignStyle="modal"              → avatar pills + "Assign" button → AssignModal
//   assignStyle="inline" cycle       → tap an avatar to cycle 0→1→2…→max→0 (×N badge)
//   assignStyle="inline" stepper     → tap avatar to add, then a −/+ stepper per person
//
// The card border turns accent once at least one person is assigned.
import { useState } from 'react';
import { Avatar } from './Avatar';
import { Stepper } from './Stepper';
import { AssignModal } from './AssignModal';
import { fmt } from '../lib/format';
import type { Assignments, AssignStyle, InlineMode, Item, Person } from '../types';

interface ItemCardProps {
  item: Item;
  people: Person[];
  assignments: Assignments;
  onSave: (itemId: number, shareMap: Record<number, number>) => void;
  assignStyle: AssignStyle;
  inlineMode: InlineMode;
}

export function ItemCard({ item, people, assignments, onSave, assignStyle, inlineMode }: ItemCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const itemMap = assignments[item.id] || {};
  const assignedList = Object.entries(itemMap).map(([pid, n]) => ({ pid: Number(pid), count: n }));
  const isAssigned = assignedList.length > 0;
  const total = assignedList.reduce((s, x) => s + x.count, 0);

  const setPersonShare = (pid: number, n: number) =>
    onSave(
      item.id,
      (() => {
        const next = { ...itemMap };
        if (n <= 0) delete next[pid];
        else next[pid] = n;
        return next;
      })(),
    );

  // Cycle mode: tap cycles 0 → 1 → … → max → 0 (max ≥ 2 so qty-1 items can be shared)
  const cycleClick = (pid: number) => {
    const curr = itemMap[pid] || 0;
    const max = Math.max(item.quantity, 2);
    setPersonShare(pid, curr >= max ? 0 : curr + 1);
  };

  return (
    <div
      className="rounded-[18px] bg-surface px-[18px] py-4 transition-colors duration-200"
      style={{ border: `1.5px solid ${isAssigned ? 'var(--accent)' : 'var(--border)'}` }}
    >
      {/* Header row: name + modifiers, price */}
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2.5">
          <div className="mb-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold">{item.name}</div>
          <div className="flex flex-wrap gap-1">
            {item.modifiers.map((m, i) => (
              <span key={i} className="rounded-md bg-surface-hi px-[7px] py-0.5 text-[10px] text-ink-muted">
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-base font-extrabold">{fmt(item.price * item.quantity)}</div>
          {item.quantity > 1 && (
            <div className="text-[11px] text-ink-muted">
              ×{item.quantity} @ {fmt(item.price)}
            </div>
          )}
        </div>
      </div>

      {/* Assignment UI */}
      {assignStyle === 'modal' ? (
        <>
          {isAssigned && (
            <div className="mb-2.5 flex flex-wrap gap-[5px]">
              {assignedList.map(({ pid, count }) => {
                const idx = people.findIndex(p => p.id === pid);
                const person = people[idx];
                return person ? (
                  <div key={pid} className="relative">
                    <Avatar person={person} index={idx} size={26} filled />
                    {count > 1 && (
                      <span
                        className="absolute -bottom-[3px] -right-1 flex h-4 min-w-4 items-center justify-center rounded-lg bg-accent px-1 text-[9px] font-extrabold text-[#111]"
                        style={{ border: '1.5px solid var(--surface)' }}
                      >
                        ×{count}
                      </span>
                    )}
                  </div>
                ) : null;
              })}
              {total > 1 && (
                <span className="self-center ml-1 text-[11px] text-ink-muted">
                  {total} share{total !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setModalOpen(true)}
            className="w-full rounded-[11px] py-[9px] text-xs font-semibold transition-all duration-150"
            style={{
              background: isAssigned ? 'var(--accent-dim)' : 'var(--surface-hi)',
              border: `1px solid ${isAssigned ? 'var(--accent)' : 'transparent'}`,
              color: isAssigned ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {isAssigned ? `${assignedList.length} assigned · change` : '+ Assign to people'}
          </button>
        </>
      ) : (
        <div>
          <div className="mb-[7px] flex justify-between text-[11px] font-medium text-ink-dim">
            <span>
              {people.length === 0
                ? 'Add people to assign'
                : inlineMode === 'stepper'
                ? 'Assign shares:'
                : 'Tap to add a share:'}
            </span>
            {total > 0 && (
              <span className="text-ink-muted">
                {total} share{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {inlineMode === 'stepper' ? (
            /* ── Stepper mode ── */
            <div className="flex flex-wrap items-center gap-[7px]">
              {people.map((p, i) => {
                const n = itemMap[p.id] || 0;
                if (n > 0) {
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-1 rounded-full py-0.5 pl-1 pr-0.5"
                      style={{ background: 'var(--accent-dim)', border: '1.5px solid var(--accent)' }}
                    >
                      <Avatar person={p} index={i} size={26} filled />
                      <Stepper value={n} onChange={v => setPersonShare(p.id, v)} size="sm" />
                    </div>
                  );
                }
                return (
                  <Avatar key={p.id} person={p} index={i} size={34} filled={false} onClick={() => setPersonShare(p.id, 1)} />
                );
              })}
            </div>
          ) : (
            /* ── Cycle mode ── */
            <div className="flex flex-wrap gap-[7px]">
              {people.map((p, i) => {
                const n = itemMap[p.id] || 0;
                return (
                  <div key={p.id} className="relative">
                    <Avatar person={p} index={i} size={34} filled={n > 0} onClick={() => cycleClick(p.id)} />
                    {n > 1 && (
                      <span
                        className="pointer-events-none absolute -bottom-[3px] -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] bg-accent px-1 text-[10px] font-extrabold text-[#111]"
                        style={{ border: '2px solid var(--surface)' }}
                      >
                        ×{n}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <AssignModal item={item} people={people} assignments={assignments} onSave={onSave} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
