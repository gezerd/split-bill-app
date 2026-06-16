// Step 2 — Assign. Add people (name input → chips), then assign each receipt
// item via ItemCard. "Next" unlocks only when ≥1 person exists and every item
// has at least one assignee.
import { useRef, useState } from 'react';
import { Avatar } from '../Avatar';
import { ItemCard } from '../ItemCard';
import type { Assignments, AssignStyle, InlineMode, Item, Person } from '../../types';

interface AssignStepProps {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  items: Item[];
  assignments: Assignments;
  setAssignments: React.Dispatch<React.SetStateAction<Assignments>>;
  assignStyle: AssignStyle;
  inlineMode: InlineMode;
  onNext: () => void;
}

export function AssignStep({
  people, setPeople, items, assignments, setAssignments, assignStyle, inlineMode, onNext,
}: AssignStepProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addPerson = () => {
    if (!name.trim()) return;
    setPeople(prev => [...prev, { id: Date.now(), name: name.trim() }]);
    setName('');
    inputRef.current?.focus();
  };

  const removePerson = (id: number) => {
    setPeople(prev => prev.filter(x => x.id !== id));
    setAssignments(prev => {
      const next: Assignments = {};
      Object.entries(prev).forEach(([k, m]) => {
        const nm = { ...m };
        delete nm[id];
        if (Object.keys(nm).length > 0) next[Number(k)] = nm;
      });
      return next;
    });
  };

  const onSave = (id: number, shareMap: Record<number, number>) =>
    setAssignments(prev => ({ ...prev, [id]: shareMap }));

  const unassigned = items.filter(it => {
    const m = assignments[it.id] || {};
    return Object.values(m).reduce((s, v) => s + v, 0) < it.quantity;
  }).length;
  const canNext = people.length > 0 && unassigned === 0;

  return (
    <div className="fade-up">
      <h2 className="mb-1 text-[26px] font-extrabold">Who's splitting?</h2>
      <p className="mb-7 text-sm text-ink-muted">Add everyone, then tap each item to assign it.</p>

      {/* Add person */}
      <div className="mb-[18px] flex gap-2">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPerson()}
          placeholder="Enter a name…"
          className="flex-1 rounded-[13px] border-[1.5px] border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-accent"
        />
        <button
          onClick={addPerson}
          disabled={!name.trim()}
          className="rounded-[13px] border-0 px-5 py-3 text-sm font-bold transition-all duration-150"
          style={{
            background: name.trim() ? 'var(--accent)' : 'var(--surface-hi)',
            color: name.trim() ? '#111' : 'var(--text-dim)',
          }}
        >
          + Add
        </button>
      </div>

      {/* People chips */}
      {people.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {people.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-full border-[1.5px] border-line bg-surface py-1.5 pl-1.5 pr-2.5"
            >
              <Avatar person={p} index={i} size={26} filled />
              <span className="text-[13px] font-semibold">{p.name}</span>
              <button
                onClick={() => removePerson(p.id)}
                className="ml-0.5 cursor-pointer border-0 bg-transparent px-0.5 text-[17px] leading-none text-ink-dim"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Items header */}
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-ink-muted">Items from receipt</span>
        {unassigned > 0 && (
          <span className="rounded-full bg-surface-hi px-2.5 py-[3px] text-xs text-ink-muted">{unassigned} unassigned</span>
        )}
        {unassigned === 0 && items.length > 0 && (
          <span className="rounded-full bg-accent-dim px-2.5 py-[3px] text-xs font-semibold text-accent">All assigned ✓</span>
        )}
      </div>

      {/* Items grid */}
      <div
        className="mb-8 grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}
      >
        {items.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            people={people}
            assignments={assignments}
            onSave={onSave}
            assignStyle={assignStyle}
            inlineMode={inlineMode}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canNext}
          className="rounded-[14px] border-0 px-8 py-3.5 text-[15px] font-bold transition-all duration-200"
          style={{
            background: canNext ? 'var(--accent)' : 'var(--surface-hi)',
            color: canNext ? '#111' : 'var(--text-dim)',
            cursor: canNext ? 'pointer' : 'not-allowed',
          }}
        >
          {!people.length
            ? 'Add people first'
            : unassigned > 0
            ? `${unassigned} item${unassigned > 1 ? 's' : ''} remaining`
            : 'Next: Tax & Tip →'}
        </button>
      </div>
    </div>
  );
}
