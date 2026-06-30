import { useState, useEffect } from 'react';

const TIP_PRESETS = ['15', '18', '20', '22', '25'];

function getInitialPreset(tip, subtotal) {
  if (!tip || !subtotal) return null;
  const pct = ((tip / subtotal) * 100).toFixed(0);
  return TIP_PRESETS.includes(pct) ? pct : 'custom';
}

export default function TipTaxInput({ tax, tip, subtotal, onUpdateTax, onUpdateTip, onBack, onNext }) {
  const [taxValue, setTaxValue] = useState(tax || 0);
  const [tipMode, setTipMode] = useState(() => (tip > 0 ? 'add' : 'none'));
  const [selectedPreset, setSelectedPreset] = useState(() => getInitialPreset(tip, subtotal));
  const [customTip, setCustomTip] = useState(tip || '');

  useEffect(() => { setTaxValue(tax || 0); }, [tax]);
  useEffect(() => {
    setSelectedPreset(getInitialPreset(tip, subtotal));
    setCustomTip(tip || '');
  }, [tip, subtotal]);

  const handleTaxBlur = () => onUpdateTax(parseFloat(taxValue) || 0);

  const handleTipModeChange = (mode) => {
    setTipMode(mode);
    if (mode === 'none') {
      setSelectedPreset(null);
      onUpdateTip(0);
    }
  };

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const amount = parseFloat(((subtotal * parseInt(preset)) / 100).toFixed(2));
      onUpdateTip(amount);
    }
  };

  const handleCustomBlur = () => onUpdateTip(parseFloat(customTip) || 0);

  const computedTip = tipMode === 'none' ? 0
    : selectedPreset && selectedPreset !== 'custom'
      ? (subtotal * parseInt(selectedPreset)) / 100
      : parseFloat(customTip) || 0;

  const total = parseFloat(subtotal || 0) + parseFloat(taxValue || 0) + computedTip;

  const fieldStyle = {
    display: 'flex', alignItems: 'center',
    background: '#254862', borderRadius: 12,
    padding: '0 16px', border: '1.5px solid #2E5674',
  };
  const inputStyle = {
    flex: 1, background: 'none', border: 'none',
    color: '#EEF4FA', fontSize: 16, fontWeight: 600,
    padding: '11px 0', outline: 'none',
  };

  return (
    <div className="fade-up mx-auto" style={{ maxWidth: 500 }}>
      <h2 className="font-extrabold" style={{ fontSize: 26, marginBottom: 4 }}>Tax &amp; tip</h2>
      <p className="text-gray-400" style={{ fontSize: 14, marginBottom: 28 }}>
        These are split proportionally based on what each person ordered.
      </p>

      {/* Panel */}
      <div style={{
        background: '#1C3A54', borderRadius: 22, padding: 24,
        border: '1px solid #2E5674', marginBottom: 16,
      }}>
        {/* Subtotal */}
        <div className="flex justify-between items-center" style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #2E5674' }}>
          <span style={{ color: '#A0C4DC', fontSize: 14 }}>Subtotal</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>${parseFloat(subtotal || 0).toFixed(2)}</span>
        </div>

        {/* Tax */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#A0C4DC', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tax</div>
          <div style={fieldStyle}>
            <span style={{ color: '#A0C4DC', marginRight: 8, fontSize: 15 }}>$</span>
            <input
              type="number" step="0.01" min="0"
              value={taxValue}
              onChange={(e) => setTaxValue(e.target.value)}
              onBlur={handleTaxBlur}
              style={inputStyle}
            />
          </div>
          <p style={{ fontSize: 12, color: '#7AAAB8', marginTop: 5 }}>Auto-extracted from receipt, tap to edit</p>
        </div>

        {/* Tip */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#A0C4DC', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tip</div>

          {/* No tip / Add tip toggle */}
          <div className="flex" style={{ gap: 6, marginBottom: 12 }}>
            {['none', 'add'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleTipModeChange(mode)}
                className={tipMode === mode ? 'accent-hover' : ''}
                style={{
                  flex: 1, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: tipMode === mode ? '#00FDDC' : '#254862',
                  color: tipMode === mode ? '#111' : '#A0C4DC',
                  transition: '0.15s',
                }}
              >
                {mode === 'none' ? 'No tip' : 'Add tip'}
              </button>
            ))}
          </div>

          {/* Presets — only when adding tip */}
          {tipMode === 'add' && (
            <>
              <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 12 }}>
                {TIP_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handlePresetClick(pct)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                      background: selectedPreset === pct ? '#00FDDC' : '#254862',
                      color: selectedPreset === pct ? '#111' : '#A0C4DC',
                      transition: '0.15s',
                    }}
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => handlePresetClick('custom')}
                  style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                    background: selectedPreset === 'custom' ? '#00FDDC' : '#254862',
                    color: selectedPreset === 'custom' ? '#111' : '#A0C4DC',
                    transition: '0.15s',
                  }}
                >
                  Custom
                </button>
              </div>

              {selectedPreset === 'custom' && (
                <div style={{ ...fieldStyle, marginBottom: 8 }}>
                  <span style={{ color: '#A0C4DC', marginRight: 8, fontSize: 15 }}>$</span>
                  <input
                    type="number" step="0.01" min="0"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    onBlur={handleCustomBlur}
                    placeholder="0.00"
                    autoFocus
                    style={inputStyle}
                  />
                </div>
              )}

              {selectedPreset && (
                <p style={{ fontSize: 13, color: '#A0C4DC' }}>= ${computedTip.toFixed(2)}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Total pill */}
      <div className="flex justify-between items-center" style={{
        background: '#00FDDC', borderRadius: 18, padding: '18px 24px', marginBottom: 24,
      }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>Total</span>
        <span style={{ fontWeight: 800, fontSize: 28, color: '#111', letterSpacing: -1 }}>${total.toFixed(2)}</span>
      </div>

      {/* Buttons */}
      <div className="flex" style={{ gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: '14px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700,
            background: '#254862', color: '#A0C4DC', transition: '0.2s',
          }}
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="accent-hover"
          style={{
            flex: 1, padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 700,
            background: '#00FDDC', color: '#111', transition: '0.2s',
          }}
        >
          See Breakdown →
        </button>
      </div>
    </div>
  );
}
