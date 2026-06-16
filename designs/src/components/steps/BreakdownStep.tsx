// Step 4 — Breakdown. "All settled!" summary with a Cards / Receipt view
// toggle (seeded from the `defaultStyle` config). Computes per-person
// settlement via calcBreakdown().
import { useEffect, useState } from 'react';
import { CardBreakdown } from '../breakdown/CardBreakdown';
import { ReceiptBreakdown } from '../breakdown/ReceiptBreakdown';
import { calcBreakdown } from '../../lib/assignments';
import type { Assignments, BreakdownStyle, Item, Person } from '../../types';

interface BreakdownStepProps {
  items: Item[];
  people: Person[];
  assignments: Assignments;
  tax: number;
  tip: number;
  defaultStyle: BreakdownStyle;
  onReset: () => void;
  onBack: () => void;
}

export function BreakdownStep({
  items, people, assignments, tax, tip, defaultStyle, onReset, onBack,
}: BreakdownStepProps) {
  const [style, setStyle] = useState<BreakdownStyle>(defaultStyle);
  useEffect(() => { setStyle(defaultStyle); }, [defaultStyle]);

  const data = calcBreakdown(items, people, assignments, tax, tip);

  return (
    <div className="fade-up">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="mb-1 text-[26px] font-extrabold">All settled!</h2>
          <p className="text-sm text-ink-muted">Here's what everyone owes.</p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1.5 rounded-xl border border-line bg-surface p-1">
          {(['cards', 'receipt'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className="rounded-[9px] border-0 px-4 py-[7px] text-xs font-bold capitalize transition-all duration-150"
              style={{
                background: style === s ? 'var(--accent)' : 'transparent',
                color: style === s ? '#111' : 'var(--text-muted)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {style === 'cards' ? <CardBreakdown data={data} /> : <ReceiptBreakdown data={data} tax={tax} tip={tip} />}

      <div className="mt-8 flex gap-2.5">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-[14px] border-0 bg-surface-hi px-6 py-3.5 text-sm font-bold text-ink-muted"
        >
          ← Back
        </button>
        <button
          onClick={onReset}
          className="flex-1 cursor-pointer rounded-[14px] border-[1.5px] border-line bg-transparent py-3.5 text-sm font-bold text-ink-muted"
        >
          Start New Bill
        </button>
      </div>
    </div>
  );
}
