import { useState, useEffect } from 'react';
import { getBreakdown } from '../api/client';

export default function FinalBreakdown({ billId, items, assignments }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const allAssigned =
    items &&
    items.length > 0 &&
    items.every((item) => {
      const itemAssignments = assignments ? assignments.filter((a) => a.item_id === item.id) : [];
      const totalShares = itemAssignments.reduce((sum, a) => sum + (a.share_count || 1), 0);
      return totalShares >= (item.quantity || 1);
    });

  const fetchBreakdown = async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getBreakdown(billId);
      setBreakdown(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch breakdown:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId && allAssigned) {
      fetchBreakdown();
    } else {
      setBreakdown(null);
    }
  }, [billId, allAssigned]);

  if (!billId) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-red-400">Failed to calculate breakdown: {error}</p>
          <button
            onClick={fetchBreakdown}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!allAssigned || !breakdown || !breakdown.people || breakdown.people.length === 0) {
    const unassignedCount = items
      ? items.filter((item) => !assignments || !assignments.some((a) => a.item_id === item.id)).length
      : 0;

    return (
      <div className="bg-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Final Breakdown</h2>
        <p className="text-gray-400 text-center py-8">
          {unassignedCount > 0
            ? `Assign all items to see the breakdown (${unassignedCount} item${unassignedCount > 1 ? 's' : ''} remaining).`
            : 'Add people and assign items to see the breakdown.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Final Breakdown</h2>
        <button
          onClick={fetchBreakdown}
          className="text-sm text-primary-500 hover:text-primary-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {breakdown.people.map((personData) => (
          <div key={personData.person_id} className="border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-100">{personData.name}</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-100">
                  ${parseFloat(personData.total).toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
            </div>

            {/* Items */}
            {personData.items && personData.items.length > 0 && (
              <div className="mb-3 space-y-1">
                {personData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-400">
                    <span>
                      {item.name}
                      {item.total_shares > 1 && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({item.share_count}/{item.total_shares})
                        </span>
                      )}
                    </span>
                    <span>${parseFloat(item.share_amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Breakdown */}
            <div className="border-t border-gray-700 pt-3 space-y-1 text-sm">
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
          </div>
        ))}
      </div>
    </div>
  );
}
