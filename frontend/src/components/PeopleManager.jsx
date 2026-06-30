import { useState } from 'react';

export const AVATAR_COLORS = [
  'bg-[#F87171]',
  'bg-[#60A5FA]',
  'bg-[#A78BFA]',
  'bg-[#4ADE80]',
  'bg-[#FBBF24]',
  'bg-[#F472B6]',
  'bg-[#FB923C]',
  'bg-[#38BDF8]',
];

export const AVATAR_COLORS_OUTLINE = [
  'border-[#F87171] text-[#F87171]',
  'border-[#60A5FA] text-[#60A5FA]',
  'border-[#A78BFA] text-[#A78BFA]',
  'border-[#4ADE80] text-[#4ADE80]',
  'border-[#FBBF24] text-[#FBBF24]',
  'border-[#F472B6] text-[#F472B6]',
  'border-[#FB923C] text-[#FB923C]',
  'border-[#38BDF8] text-[#38BDF8]',
];

const AVATAR_PLAIN_COLORS = [
  '#F87171','#60A5FA','#A78BFA','#4ADE80',
  '#FBBF24','#F472B6','#FB923C','#38BDF8',
];

export function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
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

  const canAdd = !adding && !!newPersonName.trim();

  return (
    <div>
      {/* Add row */}
      <form onSubmit={handleSubmit} className="flex gap-2" style={{ marginBottom: 18 }}>
        <input
          type="text"
          value={newPersonName}
          onChange={(e) => setNewPersonName(e.target.value)}
          placeholder="Enter a name…"
          disabled={adding}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 13,
            background: '#1C3A54', border: '1.5px solid #2E5674',
            color: '#EEF4FA', fontSize: 14, outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#00FDDC'}
          onBlur={e => e.target.style.borderColor = '#2E5674'}
        />
        <button
          type="submit"
          disabled={!canAdd}
          className={canAdd ? 'accent-hover' : ''}
          style={{
            padding: '12px 20px', borderRadius: 13, fontSize: 15, fontWeight: 700,
            background: canAdd ? '#00FDDC' : '#254862',
            color: canAdd ? '#111' : '#7AAAB8',
            cursor: canAdd ? 'pointer' : 'not-allowed',
            transition: '0.15s',
          }}
        >
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {/* People chips */}
      {people.length > 0 && (
        <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 32 }}>
          {people.map((person, index) => {
            const color = AVATAR_PLAIN_COLORS[index % AVATAR_PLAIN_COLORS.length];
            return (
              <div
                key={person.id}
                className="flex items-center"
                style={{
                  gap: 8, padding: '6px 10px 6px 6px',
                  borderRadius: 100, background: '#1C3A54',
                  border: '1.5px solid #2E5674',
                }}
              >
                <div
                  className="flex items-center justify-center font-extrabold shrink-0"
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: color, color: '#111', fontSize: 10,
                  }}
                >
                  {getInitials(person.name)}
                </div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{person.name}</span>
                <button
                  onClick={() => handleDelete(person.id)}
                  style={{ color: '#7AAAB8', fontSize: 17, lineHeight: 1, padding: '0 2px', marginLeft: 2 }}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
