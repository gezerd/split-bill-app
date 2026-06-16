// ReceiptBreakdown — alternate Step-4 layout styled as a printed paper
// receipt: monospace type, dashed dividers, torn zig-zag edges top & bottom.
import { AVATAR_COLORS } from '../../lib/constants';
import { fmt } from '../../lib/format';
import type { PersonBreakdown } from '../../types';

interface ReceiptBreakdownProps {
  data: PersonBreakdown[];
  tax: number;
  tip: number;
}

export function ReceiptBreakdown({ data, tax, tip }: ReceiptBreakdownProps) {
  const subtotal = data.reduce((s, d) => s + d.subtotal, 0);

  // Torn-edge mask. NOTE: the fill (%23232E27 = #232E27) is the "behind the
  // paper" color — match it to your page background if you change --bg.
  const zigzag =
    `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Cpath d='M0 8 L8 0 L16 8' fill='%23232E27' stroke='none'/%3E%3C/svg%3E")`;

  return (
    <div className="mx-auto max-w-[380px]">
      {/* top torn edge */}
      <div style={{ height: 16, backgroundImage: zigzag, backgroundRepeat: 'repeat-x', backgroundSize: '16px 8px', backgroundPosition: 'bottom' }} />

      <div className="border-x border-line bg-surface px-8 py-7 font-mono">
        <div className="mb-[22px] text-center">
          <div className="text-[15px] font-bold uppercase tracking-[3px]">SPLIT BILL</div>
          <div className="mt-1 text-[11px] text-ink-muted">itemized receipt</div>
        </div>
        <div className="mb-[18px] border-b border-dashed border-line" />

        {data.map((d, i) => (
          <div key={d.person.id} className="mb-[18px]">
            <div
              className="mb-[9px] text-xs font-bold uppercase tracking-[1.5px]"
              style={{ color: AVATAR_COLORS[d.colorIndex % AVATAR_COLORS.length] }}
            >
              {d.person.name}
            </div>
            {d.items.map((it, j) => (
              <div key={j} className="mb-[3px] flex justify-between text-xs">
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap pr-3 text-ink-muted">
                  {it.name}
                  {it.totalShares > 1 && ` (${it.myShares}/${it.totalShares})`}
                </span>
                <span>{fmt(it.amount)}</span>
              </div>
            ))}
            <div className="mt-[5px] flex justify-between border-t border-dotted border-line pt-[5px] text-[13px] font-bold">
              <span>TOTAL</span>
              <span className="text-accent">{fmt(d.total)}</span>
            </div>
            {i < data.length - 1 && <div className="mt-3.5 border-b border-dashed border-line" />}
          </div>
        ))}

        {/* Grand totals */}
        <div className="mt-[18px] border-t-2 border-line pt-4">
          {([['SUBTOTAL', subtotal], ['TAX', tax], ['TIP', tip]] as const).map(([l, v]) => (
            <div key={l} className="mb-1 flex justify-between text-xs text-ink-muted">
              <span>{l}</span>
              <span>{fmt(v)}</span>
            </div>
          ))}
          <div className="mt-2.5 flex justify-between border-t border-dashed border-line pt-2.5 text-sm font-bold">
            <span>GRAND TOTAL</span>
            <span className="text-accent">{fmt(subtotal + tax + tip)}</span>
          </div>
        </div>
      </div>

      {/* bottom torn edge (flipped) */}
      <div style={{ height: 16, backgroundImage: zigzag, backgroundRepeat: 'repeat-x', backgroundSize: '16px 8px', transform: 'scaleY(-1)' }} />
    </div>
  );
}
