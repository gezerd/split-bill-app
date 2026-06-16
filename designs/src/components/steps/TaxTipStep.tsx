// Step 3 — Tax & Tip. Editable tax field (pre-filled from receipt) + tip as a
// percentage preset (15/18/20/22/25) or custom dollar amount. Shows a live
// accent "Total" pill. Tax & tip are split proportionally downstream.
import { useState } from 'react';
import { TIP_PRESETS } from '../../lib/constants';
import { fmt } from '../../lib/format';

interface TaxTipStepProps {
  subtotal: number;
  tax: number;
  setTax: (n: number) => void;
  setTip: (n: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TaxTipStep({ subtotal, tax, setTax, setTip, onNext, onBack }: TaxTipStepProps) {
  const [taxVal, setTaxVal] = useState(String(tax));
  const [tipMode, setTipMode] = useState<'pct' | 'custom'>('pct');
  const [tipPct, setTipPct] = useState(18);
  const [customTipVal, setCustomTipVal] = useState('');

  const taxNum = parseFloat(taxVal) || 0;
  const tipAmt = tipMode === 'pct' ? (subtotal * tipPct) / 100 : parseFloat(customTipVal) || 0;
  const total = subtotal + taxNum + tipAmt;

  const handleNext = () => {
    setTax(taxNum);
    setTip(tipAmt);
    onNext();
  };

  return (
    <div className="fade-up max-w-[500px]">
      <h2 className="mb-1 text-[26px] font-extrabold">Tax & tip</h2>
      <p className="mb-7 text-sm text-ink-muted">
        These are split proportionally based on what each person ordered.
      </p>

      <div className="mb-4 rounded-[22px] border border-line bg-surface p-6">
        {/* Subtotal */}
        <div className="mb-4 flex justify-between border-b border-line pb-4">
          <span className="text-sm text-ink-muted">Subtotal</span>
          <span className="text-sm font-bold">{fmt(subtotal)}</span>
        </div>

        {/* Tax */}
        <div className="mb-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[.5px] text-ink-muted">Tax</div>
          <div className="flex items-center rounded-xl border-[1.5px] border-line bg-surface-hi px-4">
            <span className="mr-2 text-[15px] text-ink-muted">$</span>
            <input
              type="number" step="0.01" min="0" value={taxVal}
              onChange={e => setTaxVal(e.target.value)}
              className="flex-1 border-0 bg-transparent py-[11px] text-base font-semibold text-ink outline-none"
            />
          </div>
          <p className="mt-[5px] text-xs text-ink-dim">Auto-extracted from receipt, tap to edit</p>
        </div>

        {/* Tip */}
        <div>
          <div className="mb-2.5 text-xs font-semibold uppercase tracking-[.5px] text-ink-muted">Tip</div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {TIP_PRESETS.map(p => {
              const active = tipMode === 'pct' && tipPct === p;
              return (
                <button
                  key={p}
                  onClick={() => { setTipMode('pct'); setTipPct(p); }}
                  className="rounded-[10px] border-0 px-3.5 py-2 text-[13px] font-bold transition-all duration-150"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--surface-hi)',
                    color: active ? '#111' : 'var(--text-muted)',
                  }}
                >
                  {p}%
                </button>
              );
            })}
            <button
              onClick={() => setTipMode('custom')}
              className="rounded-[10px] border-0 px-3.5 py-2 text-[13px] font-bold transition-all duration-150"
              style={{
                background: tipMode === 'custom' ? 'var(--accent)' : 'var(--surface-hi)',
                color: tipMode === 'custom' ? '#111' : 'var(--text-muted)',
              }}
            >
              Custom
            </button>
          </div>

          {tipMode === 'pct' ? (
            <p className="text-[13px] text-ink-muted">= {fmt((subtotal * tipPct) / 100)}</p>
          ) : (
            <div className="flex items-center rounded-xl border-[1.5px] border-line bg-surface-hi px-4">
              <span className="mr-2 text-[15px] text-ink-muted">$</span>
              <input
                type="number" step="0.01" min="0" placeholder="0.00" value={customTipVal}
                onChange={e => setCustomTipVal(e.target.value)}
                autoFocus
                className="flex-1 border-0 bg-transparent py-[11px] text-base font-semibold text-ink outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Total pill */}
      <div className="mb-6 flex items-center justify-between rounded-[18px] bg-accent px-6 py-[18px]">
        <span className="text-base font-bold text-[#111]">Total</span>
        <span className="text-[28px] font-extrabold tracking-[-1px] text-[#111]">{fmt(total)}</span>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={onBack}
          className="cursor-pointer rounded-[14px] border-0 bg-surface-hi px-6 py-3.5 text-sm font-bold text-ink-muted"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 cursor-pointer rounded-[14px] border-0 bg-accent py-3.5 text-[15px] font-bold text-[#111]"
        >
          See Breakdown →
        </button>
      </div>
    </div>
  );
}
