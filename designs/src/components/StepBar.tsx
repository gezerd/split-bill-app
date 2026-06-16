// StepBar — horizontal 4-step progress indicator (Upload → Assign → Tax & Tip → Done).
// `step` is the 0-indexed CURRENT step; earlier steps render a check, the
// active step gets an accent ring, future steps are dimmed.
import { Fragment } from 'react';
import { STEP_LABELS } from '../lib/constants';

export function StepBar({ step }: { step: number }) {
  return (
    <div className="mb-10 flex items-start">
      {STEP_LABELS.map((label, i) => (
        <Fragment key={i}>
          <div className="flex flex-shrink-0 flex-col items-center gap-[7px]">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-extrabold transition-all duration-[350ms]"
              style={{
                background: i <= step ? 'var(--accent)' : 'var(--surface-hi)',
                color: i <= step ? '#111' : 'var(--text-dim)',
                boxShadow: i === step ? '0 0 0 5px var(--accent-dim)' : 'none',
                transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className="whitespace-nowrap text-[11px] transition-colors duration-300"
              style={{
                fontWeight: i === step ? 700 : 400,
                color:
                  i === step ? 'var(--accent)' : i < step ? 'var(--text-muted)' : 'var(--text-dim)',
              }}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className="mt-4 h-0.5 flex-1 transition-colors duration-[350ms]"
              style={{ background: i < step ? 'var(--accent)' : 'var(--border)' }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
