import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Stepper from './Stepper';

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: '#A0C4DC',
  marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5,
};
const ghostBtn = {
  flex: 1, padding: 13, borderRadius: 13, fontSize: 14, fontWeight: 700,
  background: 'none', border: '1.5px solid #2E5674', color: '#A0C4DC', cursor: 'pointer',
};
const fieldStyle = {
  width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
  background: '#254862', border: '1.5px solid #2E5674',
  color: '#EEF4FA', fontSize: 15, outline: 'none', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};
const PRICE_PATTERN = /^\d*\.?\d{0,2}$/;

export default function ItemModal({ mode, item, onClose, onSubmit }) {
  const isEdit = mode === 'edit';

  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [modifiers, setModifiers] = useState(item?.customModifiers || []);
  const [modInput, setModInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const priceValue = parseFloat(price);
  const canSubmit = name.trim() !== '' && priceValue > 0;
  const total = (priceValue || 0) * quantity;

  const handleAddMod = () => {
    if (!modInput.trim()) return;
    setModifiers(prev => [...prev, modInput.trim()]);
    setModInput('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), price: priceValue, quantity, customModifiers: modifiers });
    } finally {
      setSubmitting(false);
    }
  };

  const focusBorder = e => { e.target.style.borderColor = '#00FDDC'; };
  const blurBorder = e => { e.target.style.borderColor = '#2E5674'; };
  const hasMod = modInput.trim() !== '';

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-[200]"
      style={{ background: 'rgba(0,0,0,0.72)', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        role="dialog"
        aria-label={isEdit ? 'Edit item' : 'Add an item'}
        className="scale-in w-full"
        style={{ background: '#1C3A54', borderRadius: 22, maxWidth: 420, border: '1px solid #2E5674', overflow: 'hidden' }}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #2E5674', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{isEdit ? 'Edit item' : 'Add an item'}</div>
            <div style={{ color: '#A0C4DC', fontSize: 13, marginTop: 3 }}>
              {isEdit ? 'Update the name, price, quantity, or modifiers.' : 'Missing from the scan? Add it manually.'}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ color: '#A0C4DC', fontSize: 24, lineHeight: 1, padding: '0 2px' }}>×</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label htmlFor="item-name" style={{ ...labelStyle, display: 'block' }}>Item name</label>
            <input
              id="item-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Side of Ranch"
              autoFocus={!isEdit}
              style={fieldStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="item-price" style={{ ...labelStyle, display: 'block' }}>Price per item</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: 0, lineHeight: '46px', color: '#A0C4DC', fontSize: 15 }}>$</span>
                <input
                  id="item-price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={e => { if (PRICE_PATTERN.test(e.target.value)) setPrice(e.target.value); }}
                  placeholder="0.00"
                  style={{ ...fieldStyle, paddingLeft: 28 }}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>
            </div>
            <div>
              <div style={labelStyle}>Quantity</div>
              <Stepper value={quantity} onChange={setQuantity} min={1} height={46} />
            </div>
          </div>

          <div>
            <label htmlFor="item-modifier" style={{ ...labelStyle, display: 'block' }}>
              Modifiers{' '}
              <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>· optional</span>
            </label>
            {modifiers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {modifiers.map((mod, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#00FDDC26', color: '#00FDDC', borderRadius: 8, padding: '4px 6px 4px 10px', fontWeight: 600 }}>
                    {mod}
                    <button aria-label={`Remove ${mod}`} onClick={() => setModifiers(prev => prev.filter((_, j) => j !== i))} style={{ color: '#00FDDC', fontSize: 15, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="item-modifier"
                value={modInput}
                onChange={e => setModInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMod(); } }}
                placeholder="e.g. Extra cheese"
                style={fieldStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
              <button
                onClick={handleAddMod}
                disabled={!hasMod}
                style={{
                  height: 46, padding: '0 18px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: 'none', border: '1.5px solid #00FDDC', color: '#00FDDC',
                  opacity: hasMod ? 1 : 0.4, cursor: hasMod ? 'pointer' : 'not-allowed',
                  transition: '0.15s', whiteSpace: 'nowrap',
                }}
              >Add</button>
            </div>
          </div>
        </div>

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
              : `${isEdit ? 'Save' : 'Add item'}${canSubmit ? ` · $${total.toFixed(2)}` : ''}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
