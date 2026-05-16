import { useState } from 'react';

export const AVATAR_COLORS = [
  'bg-red-500/80',
  'bg-blue-500/80',
  'bg-purple-500/80',
  'bg-pink-500/80',
  'bg-yellow-500/80',
  'bg-indigo-500/80',
];

export function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function PeopleManager({ people, onAddPerson, onDeletePerson }) {
  const [newPersonName, setNewPersonName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    setAdding(true);
    try {
      await onAddPerson(newPersonName.trim());
      setNewPersonName('');
    } catch (error) {
      console.error('Failed to add person:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (personId) => {
    try {
      await onDeletePerson(personId);
    } catch (error) {
      console.error('Failed to delete person:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter a name…"
            className="flex-1 px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 bg-surface-2 text-gray-100 focus:ring-accent"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || !newPersonName.trim()}
            className="px-5 py-2 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </form>

      {people.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {people.map((person, index) => (
            <div
              key={person.id}
              className="flex items-center gap-2 bg-surface rounded-full pl-1 pr-3 py-1"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                }`}
              >
                {getInitials(person.name)}
              </div>
              <span className="text-sm font-medium text-gray-200">{person.name}</span>
              <button
                onClick={() => handleDelete(person.id)}
                className="text-gray-500 hover:text-gray-300 transition-colors ml-1 leading-none"
                title="Remove person"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
