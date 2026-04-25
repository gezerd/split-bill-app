import { useState } from 'react';
import ItemForm from './ItemForm';

const COLORS = [
  'bg-secondary-500/20 text-secondary-300',
  'bg-green-500/20 text-green-300',
  'bg-purple-500/20 text-purple-300',
  'bg-pink-500/20 text-pink-300',
  'bg-yellow-500/20 text-yellow-300',
  'bg-indigo-500/20 text-indigo-300',
];

export default function ItemCard({
  item,
  people,
  assignments,
  onAssignClick,
  onUpdateItem,
  onDeleteItem,
}) {
  const [editing, setEditing] = useState(false);

  // Get assignments for this item
  const itemAssignments = assignments.filter((a) => a.item_id === item.id);
  const isShared = itemAssignments.length > 1;

  // Get assigned people with their share counts
  const assignedPeople = itemAssignments.map((assignment) => {
    const person = people.find((p) => p.id === assignment.person_id);
    return {
      ...person,
      shareCount: assignment.share_count,
    };
  }).filter((p) => p && p.name); // Filter out any missing people

  const handleUpdate = async (updates) => {
    await onUpdateItem(item.id, updates);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${item.name}"? Assignments will be removed.`)) {
      await onDeleteItem(item.id);
    }
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
      className={`bg-surface rounded-lg shadow p-4 border-2 transition-all ${
        isShared
          ? 'border-orange-300 border-dashed'
          : assignedPeople.length > 0
          ? 'border-green-300'
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-100">{item.name}</h3>
            {isShared && (
              <span className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 rounded-full">
                Shared
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg font-medium text-gray-300">
              ${parseFloat(item.price).toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span className="text-sm text-gray-400">× {item.quantity}</span>
            )}
          </div>
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

        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-surface-2 rounded transition-colors"
            title="Edit item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
            title="Delete item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Assigned People */}
      {assignedPeople.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {assignedPeople.map((person) => {
            const colorIndex = people.findIndex((p) => p.id === person.id);
            return (
              <span
                key={person.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  COLORS[colorIndex % COLORS.length]
                }`}
              >
                {person.name}
                {person.shareCount > 1 && ` (×${person.shareCount})`}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="mb-3 text-sm text-gray-400 italic">Not assigned</div>
      )}

      <button
        onClick={() => onAssignClick(item)}
        className="w-full py-2 text-sm bg-surface-2 hover:bg-surface-3 text-gray-300 rounded-md transition-colors"
      >
        {assignedPeople.length > 0 ? 'Change Assignment' : 'Assign to People'}
      </button>
    </div>
  );
}
