// Stepper — compact −/value/+ control. Two sizes: 'md' (default) and 'sm'.
interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  size?: 'md' | 'sm';
}

export function Stepper({ value, onChange, size = 'md' }: StepperProps) {
  const isSm = size === 'sm';
  const h = isSm ? 26 : 32;
  const w = isSm ? 22 : 28;

  return (
    <div className="flex flex-shrink-0 items-center overflow-hidden rounded-full border border-line bg-surface">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        className={`border-0 bg-transparent font-bold leading-none ${isSm ? 'text-sm' : 'text-base'} ${
          value > 0 ? 'cursor-pointer text-ink' : 'cursor-not-allowed text-ink-dim'
        }`}
        style={{ width: w, height: h }}
      >
        −
      </button>
      <span
        className={`text-center font-bold tabular-nums ${isSm ? 'text-xs' : 'text-[13px]'} ${
          value > 0 ? 'text-accent' : 'text-ink-muted'
        }`}
        style={{ minWidth: isSm ? 18 : 22 }}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className={`cursor-pointer border-0 bg-transparent font-bold leading-none text-ink ${isSm ? 'text-sm' : 'text-base'}`}
        style={{ width: w, height: h }}
      >
        +
      </button>
    </div>
  );
}
