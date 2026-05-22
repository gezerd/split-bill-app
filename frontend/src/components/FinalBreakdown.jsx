import { useState, useEffect } from 'react';
import { getBreakdown } from '../api/client';
import { getInitials, AVATAR_COLORS } from './PeopleManager';

export default function FinalBreakdown({ billId, people, tipPercentage, onBack }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBreakdown(billId);
      setBreakdown(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, [billId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-red-400 mb-4">Failed to calculate breakdown: {error}</p>
        <button
          onClick={fetchBreakdown}
          className="px-4 py-2 bg-surface text-gray-300 rounded-lg hover:bg-surface-2 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!breakdown?.people?.length) return null;

  const grandTotal = breakdown.people.reduce((sum, p) => sum + parseFloat(p.total), 0);
  const totalItems = breakdown.people.reduce((sum, p) => sum + (p.items?.length || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-1">All settled!</h2>
      <p className="text-sm text-gray-400 mb-6">Here's what everyone owes.</p>

      {/* Per-person cards */}
      <div className={`grid gap-4 mb-6 ${
        breakdown.people.length === 1 ? 'grid-cols-1' :
        breakdown.people.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {breakdown.people.map((personData, idx) => {
          const colorIndex = people
            ? people.findIndex((p) => p.id === personData.person_id)
            : idx;
          const avatarColor = AVATAR_COLORS[(colorIndex === -1 ? idx : colorIndex) % AVATAR_COLORS.length];
          const itemCount = personData.items?.length || 0;

          return (
            <div key={personData.person_id} className="bg-surface rounded-xl p-4 flex flex-col">
              {/* Card header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor}`}>
                  {getInitials(personData.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-100 truncate">{personData.name}</div>
                  <div className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-accent font-bold text-lg shrink-0">
                  ${parseFloat(personData.total).toFixed(2)}
                </div>
              </div>

              {/* Item list */}
              {personData.items?.length > 0 && (
                <div className="space-y-1 mb-3">
                  {personData.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-400">
                      <span className="truncate mr-2">
                        {item.name}
                        {item.total_shares > 1 && (
                          <span className="text-gray-500 ml-1">×{item.share_count}/{item.total_shares}</span>
                        )}
                      </span>
                      <span className="shrink-0">${parseFloat(item.share_amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <hr className="border-gray-700 mb-3" />

              {/* Subtotal / Tax / Tip */}
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>${parseFloat(personData.subtotal).toFixed(2)}</span>
                </div>
                {parseFloat(personData.tax_amount) > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span>${parseFloat(personData.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(personData.tip_amount) > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Tip</span>
                    <span>${parseFloat(personData.tip_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total row */}
              <div className="flex justify-between text-sm font-semibold text-accent mt-auto">
                <span>Total</span>
                <span>${parseFloat(personData.total).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand total bar */}
      <div className="bg-surface rounded-xl px-5 py-4 flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">
          {breakdown.people.length} people · {totalItems} items{tipPercentage ? ` · ${tipPercentage}% tip` : ''}
        </span>
        <span className="text-accent font-bold text-xl">${grandTotal.toFixed(2)}</span>
      </div>

      {/* Footer */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-surface text-gray-300 rounded-lg hover:bg-surface-2 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 px-5 py-2.5 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          Start New Bill
        </button>
      </div>
    </div>
  );
}
