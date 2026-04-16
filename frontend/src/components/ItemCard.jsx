import { useState } from 'react';
import ItemForm from './ItemForm';

const COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
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
      className={`bg-white rounded-lg shadow p-4 border-2 transition-all ${
        isShared
          ? 'border-orange-300 border-dashed'
          : assignedPeople.length > 0
          ? 'border-green-300'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {isShared && (
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                Shared
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg font-medium text-gray-700">
              ${parseFloat(item.price).toFixed(2)}
            </span>
            {item.quantity > 1 && (
              <span className="text-sm text-gray-500">× {item.quantity}</span>
            )}
          </div>
          {item.customModifiers && item.customModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.customModifiers.map((mod, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
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
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
        className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
      >
        {assignedPeople.length > 0 ? 'Change Assignment' : 'Assign to People'}
      </button>
    </div>
  );
}
