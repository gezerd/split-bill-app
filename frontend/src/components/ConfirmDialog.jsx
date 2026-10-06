import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ghostBtn = {
  flex: 1, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
  background: 'none', border: '1.5px solid #2E5674', color: '#A0C4DC', cursor: 'pointer',
};
const dangerBtn = {
  flex: 1, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
  background: '#ff6b5e', color: '#fff', cursor: 'pointer',
};

// Reusable confirmation dialog: title, message (children, bold the name with <strong>),
// Cancel and a red action button.
export default function ConfirmDialog({ title, children, confirmLabel = 'Delete', busyLabel, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleConfirm = async () => {
    setBusy(true);
    try { await onConfirm(); } finally { setBusy(false); }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[200]"
      style={{ background: 'rgba(0,0,0,0.72)', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        role="dialog"
        aria-label={title}
        className="scale-in w-full"
        style={{ background: '#1C3A54', borderRadius: 20, maxWidth: 360, border: '1px solid #2E5674', overflow: 'hidden' }}
      >
        <div style={{ padding: '22px 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{title}</div>
          <div style={{ color: '#A0C4DC', fontSize: 14, lineHeight: 1.5 }}>{children}</div>
        </div>
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={ghostBtn}>Cancel</button>
          <button onClick={handleConfirm} disabled={busy} style={dangerBtn}>
            {busy ? (busyLabel || `${confirmLabel}…`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export const boldName = { color: '#EEF4FA', fontWeight: 700 };
