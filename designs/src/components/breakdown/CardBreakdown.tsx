// CardBreakdown — grid of per-person settlement cards (default Step-4 layout).
import { Avatar } from '../Avatar';
import { fmt } from '../../lib/format';
import type { PersonBreakdown } from '../../types';

export function CardBreakdown({ data }: { data: PersonBreakdown[] }) {
  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))' }}>
      {data.map(d => (
        <div key={d.person.id} className="overflow-hidden rounded-[20px] border border-line bg-surface">
          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-line bg-surface-hi px-5 py-4">
            <Avatar person={d.person} index={d.colorIndex} size={42} filled />
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">{d.person.name}</div>
              <div className="mt-0.5 text-xs text-ink-muted">
                {d.items.length} item{d.items.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="text-[22px] font-extrabold text-accent">{fmt(d.total)}</div>
          </div>

          {/* Line items */}
          <div className="px-5 py-3.5">
            {d.items.map((it, j) => (
              <div key={j} className="mb-[5px] flex justify-between text-[13px]">
                <span className="max-w-[65%] overflow-hidden text-ellipsis whitespace-nowrap text-ink-muted">
                  {it.name}
                  {it.totalShares > 1 && (
                    <span className="ml-1 text-[11px] text-ink-dim">
                      ({it.myShares}/{it.totalShares})
                    </span>
                  )}
                </span>
                <span className="flex-shrink-0 font-semibold">{fmt(it.amount)}</span>
              </div>
            ))}

            {/* Sub / tax / tip */}
            <div className="mt-2.5 flex flex-col gap-[3px] border-t border-line pt-2.5">
              {([['Subtotal', d.subtotal], ['Tax', d.tax], ['Tip', d.tip]] as const)
                .filter(([, v]) => v > 0.005)
                .map(([lbl, v]) => (
                  <div key={lbl} className="flex justify-between text-xs text-ink-dim">
                    <span>{lbl}</span>
                    <span>{fmt(v)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
