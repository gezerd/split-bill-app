import { useState } from 'react';

const COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-yellow-100 text-yellow-800',
  'bg-indigo-100 text-indigo-800',
];

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
    if (window.confirm('Remove this person? Their assignments will be deleted.')) {
      try {
        await onDeletePerson(personId);
      } catch (error) {
        console.error('Failed to delete person:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">People</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={adding}
          />
          <button
            type="submit"
            disabled={adding || !newPersonName.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {people.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No people added yet. Add someone to start assigning items.
          </p>
        ) : (
          people.map((person, index) => (
            <div
              key={person.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    COLORS[index % COLORS.length]
                  }`}
                >
                  {person.name}
                </span>
              </div>
              <button
                onClick={() => handleDelete(person.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Remove person"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
