import { useState } from 'react';
import ItemForm from './ItemForm';
import { getInitials, AVATAR_COLORS } from './PeopleManager';

export default function ItemCard({
  item,
  people,
  assignments,

  onUpdateItem,
  onDeleteItem,
  onAssignmentSave,
}) {
  const [editing, setEditing] = useState(false);

  const itemAssignments = assignments.filter((a) => a.item_id === item.id);
  const totalShares = itemAssignments.reduce((sum, a) => sum + (a.share_count || 1), 0);
  const isFullyAssigned = totalShares >= (item.quantity || 1);

  const assignedPeople = itemAssignments
    .map((assignment) => {
      const person = people.find((p) => p.id === assignment.person_id);
      return person ? { ...person, shareCount: assignment.share_count } : null;
    })
    .filter(Boolean);

  const handleUpdate = async (updates) => {
    await onUpdateItem(item.id, updates);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${item.name}"? Assignments will be removed.`)) {
      await onDeleteItem(item.id);
    }
  };

  const handlePersonClick = async (person) => {
    const quantity = item.quantity || 1;
    const currentAssignment = itemAssignments.find((a) => a.person_id === person.id);
    const currentShares = currentAssignment?.share_count || 0;

    const otherShares = itemAssignments
      .filter((a) => a.person_id !== person.id)
      .reduce((sum, a) => sum + (a.share_count || 1), 0);
    const remainingShares = quantity - otherShares;

    const newShareMap = new Map(
      itemAssignments.map((a) => [a.person_id, a.share_count || 1])
    );

    const maxShares = remainingShares; // quantity - otherShares = max this person can hold

    if (currentShares > 0 && currentShares >= maxShares) {
      newShareMap.delete(person.id);
    } else {
      const newShares = Math.min(currentShares + 1, maxShares);
      if (newShares === 0) return;
      newShareMap.set(person.id, newShares);
    }

    await onAssignmentSave(item.id, newShareMap);
  };

  if (editing) {
    return (
      <ItemForm
        initialData={item}
        onSubmit={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div
      className={`bg-surface rounded-lg p-4 border-l-4 transition-all ${
        isFullyAssigned ? 'border-accent' : 'border-transparent'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100">{item.name}</h3>
          {item.customModifiers && item.customModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.customModifiers.map((mod, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-surface-2 text-gray-400 rounded-full">
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-1 ml-2 shrink-0">
          <div className="text-right mr-1">
            <div className="font-semibold text-gray-100">
              ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-400">
                ×{item.quantity} @ ${parseFloat(item.price).toFixed(2)}
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-surface-2 rounded transition-colors"
            title="Edit item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            title="Delete item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Person pills */}
      {people.length === 0 ? (
        <div className="mt-3 text-xs text-gray-400">Add people to assign</div>
      ) : (
        <div className="mt-3">
          <span className="text-xs text-gray-400">Tap to add a share:</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {people.map((person) => {
              const colorIndex = people.findIndex((p) => p.id === person.id);
              const assignment = itemAssignments.find((a) => a.person_id === person.id);
              const shares = assignment?.share_count || 0;
              const assigned = shares > 0;

              return (
                <button
                  key={person.id}
                  onClick={() => handlePersonClick(person)}
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white transition-opacity ${
                    AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]
                  } ${assigned ? 'opacity-100' : 'opacity-40'}`}
                  title={person.name}
                >
                  {getInitials(person.name)}
                  {shares > 1 && (
                    <span className="absolute -bottom-1 -right-1 bg-accent text-black text-[9px] font-bold px-1 rounded-full leading-4">
                      ×{shares}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
