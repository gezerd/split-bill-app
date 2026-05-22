import { useState, useEffect } from 'react';

const TIP_PRESETS = ['15', '18', '20', '22', '25'];

function getInitialPreset(tip, subtotal) {
  if (!tip) return 'none';
  if (!subtotal) return null;
  const pct = ((tip / subtotal) * 100).toFixed(0);
  return TIP_PRESETS.includes(pct) ? pct : 'custom';
}

export default function TipTaxInput({ tax, tip, subtotal, onUpdateTax, onUpdateTip, onBack, onNext }) {
  const [taxValue, setTaxValue] = useState(tax || 0);
  const [selectedPreset, setSelectedPreset] = useState(() => getInitialPreset(tip, subtotal));
  const [customTip, setCustomTip] = useState(tip || '');

  useEffect(() => {
    setTaxValue(tax || 0);
  }, [tax]);

  useEffect(() => {
    setSelectedPreset(getInitialPreset(tip, subtotal));
    setCustomTip(tip || '');
  }, [tip, subtotal]);

  const handleTaxBlur = () => onUpdateTax(parseFloat(taxValue) || 0);

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    if (preset === 'none') {
      onUpdateTip(0);
    } else if (preset !== 'custom') {
      const amount = parseFloat(((subtotal * parseInt(preset)) / 100).toFixed(2));
      onUpdateTip(amount);
    }
  };

  const handleCustomBlur = () => {
    onUpdateTip(parseFloat(customTip) || 0);
  };

  const computedTip = selectedPreset === 'none' ? 0
    : selectedPreset && selectedPreset !== 'custom'
      ? (subtotal * parseInt(selectedPreset)) / 100
      : parseFloat(customTip) || 0;

  const total = parseFloat(subtotal || 0) + parseFloat(taxValue || 0) + computedTip;

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-1">Tax &amp; tip</h2>
      <p className="text-sm text-gray-400 mb-6">These are split proportionally based on what each person ordered.</p>

      <div className="bg-surface rounded-xl p-5 space-y-5">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Subtotal</span>
          <span className="text-gray-100 font-semibold">${parseFloat(subtotal || 0).toFixed(2)}</span>
        </div>

        <hr className="border-gray-700" />

        {/* Tax */}
        <div>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide block mb-2">Tax</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={taxValue}
              onChange={(e) => setTaxValue(e.target.value)}
              onBlur={handleTaxBlur}
              className="w-full pl-7 pr-4 py-2.5 bg-surface-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Auto-extracted from receipt. Tap to edit.</p>
        </div>

        {/* Tip */}
        <div>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide block mb-2">Tip</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePresetClick('none')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPreset === 'none'
                  ? 'bg-accent text-background'
                  : 'bg-surface-2 text-gray-400 hover:text-gray-200'
              }`}
            >
              No tip
            </button>
            {TIP_PRESETS.map((pct) => (
              <button
                key={pct}
                onClick={() => handlePresetClick(pct)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPreset === pct
                    ? 'bg-accent text-background'
                    : 'bg-surface-2 text-gray-400 hover:text-gray-200'
                }`}
              >
                {pct}%
              </button>
            ))}
            <button
              onClick={() => handlePresetClick('custom')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPreset === 'custom'
                  ? 'bg-accent text-background'
                  : 'bg-surface-2 text-gray-400 hover:text-gray-200'
              }`}
            >
              Custom
            </button>
          </div>

          {selectedPreset === 'custom' && (
            <div className="relative mt-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                onBlur={handleCustomBlur}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-2.5 bg-surface-2 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
                autoFocus
              />
            </div>
          )}

          {selectedPreset && selectedPreset !== 'none' && (
            <p className="text-sm text-gray-400 mt-2">= ${computedTip.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Total bar */}
      <div className="bg-accent rounded-xl px-5 py-4 flex items-center justify-between mt-4">
        <span className="text-background font-medium">Total</span>
        <span className="text-background font-bold text-xl">${total.toFixed(2)}</span>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-surface text-gray-300 rounded-lg hover:bg-surface-2 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-5 py-2.5 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          See Breakdown →
        </button>
      </div>
    </div>
  );
}
