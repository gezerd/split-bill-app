import { useState } from 'react';
import { createPortal } from 'react-dom';

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#A0C4DC',
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
};
const ghostBtn = {
  flex: 1, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
  background: 'none', border: '1.5px solid #2E5674', color: '#A0C4DC', cursor: 'pointer',
};
const dangerBtn = {
  flex: 1, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
  background: '#ff6b5e', color: '#fff', cursor: 'pointer',
};

export default function ItemModal({ mode, item, onClose, onSubmit, onDelete }) {
  const isEdit = mode === 'edit';
  const isDelete = mode === 'delete';

  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price ?? '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [modifiers, setModifiers] = useState(item?.customModifiers || []);
  const [modInput, setModInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() && price !== '' && parseFloat(price) > 0;
  const total = parseFloat(price || 0) * quantity;

  const handleAddMod = () => {
    if (!modInput.trim()) return;
    setModifiers(prev => [...prev, modInput.trim()]);
    setModInput('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), price: parseFloat(price), quantity, customModifiers: modifiers });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try { await onDelete(); } finally { setSubmitting(false); }
  };

  const fieldStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    background: '#254862', border: '1.5px solid #2E5674',
    color: '#EEF4FA', fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[200]"
      style={{ background: 'rgba(0,0,0,0.72)', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="scale-in w-full"
        style={{
          background: '#1C3A54', borderRadius: isDelete ? 20 : 22,
          maxWidth: isDelete ? 360 : 420,
          border: '1px solid #2E5674', overflow: 'hidden',
        }}
      >
        {/* ── Delete confirmation ── */}
        {isDelete && (
          <>
            <div style={{ padding: '22px 24px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>Delete item?</div>
              <div style={{ color: '#A0C4DC', fontSize: 14, lineHeight: 1.5 }}>
                Remove <span style={{ color: '#EEF4FA', fontWeight: 700 }}>{item.name}</span> from the bill? This also clears anyone it was assigned to.
              </div>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
              <button onClick={handleDelete} disabled={submitting} style={dangerBtn}>
                {submitting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </>
        )}

        {/* ── Add / Edit ── */}
        {!isDelete && (
          <>
            {/* Head */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E5674', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit item' : 'Add an item'}</div>
                <div style={{ color: '#A0C4DC', fontSize: 13, marginTop: 3 }}>
                  {isEdit ? 'Update the name, price, quantity, or modifiers.' : 'Missing from the scan? Add it manually.'}
                </div>
              </div>
              <button onClick={onClose} style={{ color: '#A0C4DC', fontSize: 24, lineHeight: 1, padding: '0 2px' }}>×</button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <div style={labelStyle}>Item name</div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Side of Ranch"
                  autoFocus={!isEdit}
                  style={fieldStyle}
                  onFocus={e => e.target.style.borderColor = '#00FDDC'}
                  onBlur={e => e.target.style.borderColor = '#2E5674'}
                />
              </div>

              {/* Price + Qty */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Price each</div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', background: '#254862', borderRadius: 12, padding: '0 14px', border: '1.5px solid #2E5674', transition: '0.15s' }}
                    onFocusCapture={e => e.currentTarget.style.borderColor = '#00FDDC'}
                    onBlurCapture={e => e.currentTarget.style.borderColor = '#2E5674'}
                  >
                    <span style={{ color: '#A0C4DC', marginRight: 6, fontSize: 15 }}>$</span>
                    <input
                      type="number" step="0.01" min="0"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                      style={{ flex: 1, background: 'none', border: 'none', color: '#EEF4FA', fontSize: 15, fontWeight: 600, padding: '11px 0', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Qty</div>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#1C3A54', borderRadius: 99, border: '1px solid #2E5674', overflow: 'hidden', height: 47 }}>
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      style={{ width: 30, height: '100%', fontSize: 16, fontWeight: 700, color: quantity <= 1 ? '#7AAAB8' : '#EEF4FA', cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                    >−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#00FDDC' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      style={{ width: 30, height: '100%', fontSize: 16, fontWeight: 700, color: '#EEF4FA', cursor: 'pointer' }}
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Modifiers */}
              <div>
                <div style={labelStyle}>
                  Modifiers{' '}
                  <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>· optional</span>
                </div>
                {modifiers.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {modifiers.map((mod, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#00FDDC26', color: '#00FDDC', borderRadius: 8, padding: '4px 6px 4px 10px', fontWeight: 600 }}>
                        {mod}
                        <button onClick={() => setModifiers(prev => prev.filter((_, j) => j !== i))} style={{ color: '#00FDDC', fontSize: 15, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={modInput}
                    onChange={e => setModInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMod(); } }}
                    placeholder="e.g. Extra cheese"
                    style={{ ...fieldStyle, fontSize: 14 }}
                    onFocus={e => e.target.style.borderColor = '#00FDDC'}
                    onBlur={e => e.target.style.borderColor = '#2E5674'}
                  />
                  <button
                    onClick={handleAddMod}
                    disabled={!modInput.trim()}
                    className={modInput.trim() ? 'accent-hover' : ''}
                    style={{
                      padding: '0 18px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                      background: modInput.trim() ? '#00FDDC' : '#254862',
                      color: modInput.trim() ? '#111' : '#7AAAB8',
                      cursor: modInput.trim() ? 'pointer' : 'not-allowed',
                      transition: '0.15s', whiteSpace: 'nowrap',
                    }}
                  >Add</button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={canSubmit ? 'accent-hover' : ''}
                style={{
                  flex: 2, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
                  background: canSubmit ? '#00FDDC' : '#254862',
                  color: canSubmit ? '#111' : '#7AAAB8',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: '0.15s',
                }}
              >
                {submitting
                  ? (isEdit ? 'Saving…' : 'Adding…')
                  : isEdit
                    ? `Save · $${total.toFixed(2)}`
                    : 'Add item'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
