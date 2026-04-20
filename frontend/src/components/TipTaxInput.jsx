import { useState, useEffect } from 'react';

export default function TipTaxInput({ tax, tip, subtotal, onUpdateTax, onUpdateTip }) {
  const [taxValue, setTaxValue] = useState(tax || 0);
  const [tipValue, setTipValue] = useState(tip || 0);
  const [tipMode, setTipMode] = useState('amount'); // 'amount' or 'percentage'
  const [includeTip, setIncludeTip] = useState(() => tip > 0);

  useEffect(() => {
    setTaxValue(tax || 0);
  }, [tax]);

  useEffect(() => {
    setTipValue(tip || 0);
    if (tip > 0) setIncludeTip(true);
  }, [tip]);

  const handleTaxChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTaxValue(value);
  };

  const handleTaxBlur = () => {
    onUpdateTax(taxValue);
  };

  const handleTipChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTipValue(value);
  };

  const handleTipBlur = () => {
    if (tipMode === 'percentage') {
      // Convert percentage to amount
      const tipAmount = (subtotal * tipValue) / 100;
      onUpdateTip(parseFloat(tipAmount.toFixed(2)));
    } else {
      onUpdateTip(tipValue);
    }
  };

  const handleTipModeChange = (mode) => {
    setTipMode(mode);
    if (mode === 'percentage' && subtotal > 0) {
      // Convert current tip amount to percentage
      const percentage = (tip / subtotal) * 100;
      setTipValue(parseFloat(percentage.toFixed(2)));
    } else {
      setTipValue(tip || 0);
    }
  };

  const total = parseFloat(subtotal) + parseFloat(taxValue) + parseFloat(tip);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Tax & Tip</h2>

      <div className="space-y-4">
        {/* Subtotal (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtotal
          </label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
            ${parseFloat(subtotal).toFixed(2)}
          </div>
        </div>

        {/* Tax */}
        <div>
          <label htmlFor="tax" className="block text-sm font-medium text-gray-700 mb-1">
            Tax Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-500">$</span>
            <input
              id="tax"
              type="number"
              step="0.01"
              min="0"
              value={taxValue}
              onChange={handleTaxChange}
              onBlur={handleTaxBlur}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Extracted from receipt, can be edited
          </p>
        </div>

        {/* Tip */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              id="include-tip"
              type="checkbox"
              checked={includeTip}
              onChange={(e) => {
                setIncludeTip(e.target.checked);
                if (!e.target.checked) {
                  setTipValue(0);
                  onUpdateTip(0);
                }
              }}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="include-tip" className="text-sm font-medium text-gray-700 cursor-pointer">
              Include tip
            </label>
          </div>

          {includeTip && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-500">Tip amount</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTipModeChange('amount')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      tipMode === 'amount'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Amount
                  </button>
                  <button
                    onClick={() => handleTipModeChange('percentage')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      tipMode === 'percentage'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Percentage
                  </button>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-500">
                  {tipMode === 'percentage' ? '%' : '$'}
                </span>
                <input
                  id="tip"
                  type="number"
                  step={tipMode === 'percentage' ? '1' : '0.01'}
                  min="0"
                  value={tipValue}
                  onChange={handleTipChange}
                  onBlur={handleTipBlur}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {tipMode === 'percentage' && subtotal > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  = ${((subtotal * tipValue) / 100).toFixed(2)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
