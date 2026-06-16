// Step 1 — Upload. Dropzone that simulates a receipt scan.
// idle → (click/drop) → uploading (2s spinner) → done (success check, 0.7s) → onComplete
import { useState } from 'react';

export function UploadStep({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [drag, setDrag] = useState(false);

  const simulate = () => {
    if (state !== 'idle') return;
    setState('uploading');
    setTimeout(() => {
      setState('done');
      setTimeout(onComplete, 700);
    }, 2000);
  };

  return (
    <div className="fade-up mx-auto max-w-[540px] pt-4">
      <h1 className="mb-2 text-[34px] font-extrabold tracking-[-0.5px]">Split the bill.</h1>
      <p className="mb-10 text-[15px] leading-normal text-ink-muted">
        Upload a receipt and AI extracts every item automatically.
      </p>

      <div
        onClick={simulate}
        onDragEnter={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={e => { e.preventDefault(); setDrag(false); }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); setDrag(false); simulate(); }}
        className="relative rounded-3xl px-10 py-[72px] text-center transition-all duration-200"
        style={{
          border: `2px dashed ${drag || state === 'done' ? 'var(--accent)' : 'var(--border)'}`,
          background: drag ? 'var(--accent-dim)' : 'var(--surface)',
          cursor: state === 'idle' ? 'pointer' : 'default',
        }}
      >
        {state === 'idle' && (
          <div className="fade-up">
            <svg
              width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="mx-auto mb-5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="mb-2 text-lg font-bold">Drop your receipt here</p>
            <p className="text-[13px] text-ink-muted">or click to browse · PNG, JPG, HEIC up to 10MB</p>
          </div>
        )}

        {state === 'uploading' && (
          <div className="flex flex-col items-center gap-[18px]">
            <div
              className="h-11 w-11 rounded-full"
              style={{
                border: '3px solid var(--border)',
                borderTopColor: 'var(--accent)',
                animation: 'spin .7s linear infinite',
              }}
            />
            <p className="font-semibold text-ink-muted">Scanning with AI…</p>
          </div>
        )}

        {state === 'done' && (
          <div className="scale-in flex flex-col items-center gap-3.5">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-accent text-[22px] font-extrabold text-[#111]">
              ✓
            </div>
            <p className="text-base font-bold text-accent">5 items found!</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-dim">Demo: click to simulate a receipt upload</p>
    </div>
  );
}
