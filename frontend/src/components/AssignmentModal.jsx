import { useState, useEffect } from 'react';

export default function AssignmentModal({
  item,
  people,
  currentAssignments,
  onClose,
  onSave,
}) {
  const [selectedPeople, setSelectedPeople] = useState(new Map());

  useEffect(() => {
    // Initialize with current assignments
    const initial = new Map();
    currentAssignments
      .filter((a) => a.item_id === item.id)
      .forEach((assignment) => {
        const person = people.find((p) => p.id === assignment.person_id);
        if (person) {
          initial.set(person.id, assignment.share_count || 1);
        }
      });
    setSelectedPeople(initial);
  }, [item.id, currentAssignments, people]);

  const totalShares = Array.from(selectedPeople.values()).reduce((sum, count) => sum + count, 0);
  const maxShares = item.quantity || 1;
  const remainingShares = maxShares - totalShares;
  const itemTotal = parseFloat(item.price) * maxShares;

  const handleTogglePerson = (personId) => {
    const newSelected = new Map(selectedPeople);
    if (newSelected.has(personId)) {
      newSelected.delete(personId);
    } else if (remainingShares > 0) {
      newSelected.set(personId, 1);
    }
    setSelectedPeople(newSelected);
  };

  const handleShareCountChange = (personId, count) => {
    const newSelected = new Map(selectedPeople);
    const current = newSelected.get(personId) || 1;
    const parsed = parseInt(count) || 1;
    const maxForPerson = current + remainingShares;
    newSelected.set(personId, Math.min(Math.max(1, parsed), maxForPerson));
    setSelectedPeople(newSelected);
  };

  const handleSave = async () => {
    await onSave(item.id, selectedPeople);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">{item.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                ${parseFloat(item.price).toFixed(2)}
                {item.quantity > 1 && ` × ${item.quantity}`} = $
                {itemTotal.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {people.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No people added yet. Add people first to assign items.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-400">Select people and set share counts:</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  remainingShares === 0
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-surface-2 text-gray-400'
                }`}>
                  {totalShares}/{maxShares} shares
                </span>
              </div>
              {people.map((person) => {
                const isSelected = selectedPeople.has(person.id);
                const shareCount = selectedPeople.get(person.id) || 1;
                const isDisabled = !isSelected && remainingShares === 0;

                return (
                  <div
                    key={person.id}
                    className={`border-2 rounded-lg p-3 transition-all ${
                      isSelected
                        ? 'border-secondary-500 bg-secondary-50'
                        : isDisabled
                        ? 'border-gray-700 bg-surface-2 opacity-50'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className={`flex items-center gap-3 flex-1 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => handleTogglePerson(person.id)}
                          className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed"
                        />
                        <span className="font-medium text-gray-100">{person.name}</span>
                      </label>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-400">Shares:</label>
                          <input
                            type="number"
                            min="1"
                            max={shareCount + remainingShares}
                            value={shareCount}
                            onChange={(e) => handleShareCountChange(person.id, e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-600 rounded text-center focus:outline-none focus:ring-2 bg-surface-2 text-gray-100 focus:ring-primary-500"
                          />
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-sm text-gray-400">
                        Pays: ${(parseFloat(item.price) * shareCount).toFixed(2)}
                        {totalShares > 1 && (
                          <span className="text-gray-400">
                            {' '}
                            ({shareCount}/{totalShares})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-surface">
          {selectedPeople.size > 0 && (
            <div className="mb-3 text-sm text-gray-400">
              {selectedPeople.size === 1
                ? '1 person selected'
                : `${selectedPeople.size} people selected`}
              {totalShares > selectedPeople.size && ` · ${totalShares} total shares`}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-surface-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={people.length === 0}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-surface-2 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
