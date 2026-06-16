// ─────────────────────────────────────────────────────────────────────────
// SplitBillApp — top-level state machine & layout shell.
//
// Owns the whole flow: step index (0–3), people, items, assignments, tax, tip.
// `config` selects the design variants that were "tweaks" in the prototype —
// pass real product config or wire to a settings store.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { StepBar } from './StepBar';
import { UploadStep } from './steps/UploadStep';
import { AssignStep } from './steps/AssignStep';
import { TaxTipStep } from './steps/TaxTipStep';
import { BreakdownStep } from './steps/BreakdownStep';
import { useTheme } from '../lib/theme';
import { MOCK_ITEMS, MOCK_TAX } from '../lib/constants';
import type {
  AccentName, Assignments, AssignStyle, BreakdownStyle, InlineMode, Item, Person, TextContrast,
} from '../types';

export interface SplitBillConfig {
  assignStyle: AssignStyle;       // 'inline' | 'modal'
  inlineMode: InlineMode;         // 'cycle' | 'stepper'  (when assignStyle = inline)
  breakdownStyle: BreakdownStyle; // 'cards' | 'receipt'
  accentColor: AccentName;        // 'mint' | 'gold' | 'coral' | 'cyan'
  textContrast: TextContrast;     // 'subtle' | 'balanced' | 'bright'
}

const DEFAULT_CONFIG: SplitBillConfig = {
  assignStyle: 'inline',
  inlineMode: 'cycle',
  breakdownStyle: 'cards',
  accentColor: 'cyan',
  textContrast: 'balanced',
};

export function SplitBillApp({ config }: { config?: Partial<SplitBillConfig> }) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  useTheme(cfg.accentColor, cfg.textContrast);

  const [step, setStep] = useState(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [tax, setTax] = useState(MOCK_TAX);
  const [tip, setTip] = useState(0);

  const reset = () => {
    setStep(0); setPeople([]); setItems([]); setAssignments({}); setTax(MOCK_TAX); setTip(0);
  };

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="min-h-screen px-5 pb-20 pt-9">
      <div className="mx-auto max-w-[760px]">
        {/* Wordmark */}
        <div className="mb-11 flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-accent">
            <span className="text-[17px] font-extrabold text-[#111]">$</span>
          </div>
          <span className="text-[17px] font-extrabold tracking-[-0.3px]">splitbill</span>
        </div>

        {step > 0 && <StepBar step={step - 1} />}

        {step === 0 && (
          <UploadStep onComplete={() => { setItems(MOCK_ITEMS); setStep(1); }} />
        )}
        {step === 1 && (
          <AssignStep
            people={people} setPeople={setPeople}
            items={items} assignments={assignments} setAssignments={setAssignments}
            assignStyle={cfg.assignStyle} inlineMode={cfg.inlineMode}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <TaxTipStep
            subtotal={subtotal} tax={tax} setTax={setTax} setTip={setTip}
            onNext={() => setStep(3)} onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <BreakdownStep
            items={items} people={people} assignments={assignments} tax={tax} tip={tip}
            defaultStyle={cfg.breakdownStyle} onReset={reset} onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
