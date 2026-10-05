import { getInitials, AVATAR_PLAIN_COLORS } from './PeopleManager';
import { itemStatus, describeItem } from '../lib/splitModel';

const BORDER = { full: 'border-accent', partial: 'border-[#FBBF24]', unassigned: 'border-border' };
const TONE = { dim: 'text-gray-400', warn: 'text-[#FBBF24]', ok: 'text-gray-300' };

export default function ItemCard({
  item,
  people,
  assignments,
  onEdit,
  onDeleteRequest,
  onSetShareCount,
}) {
  const itemAssignments = assignments.filter((a) => a.item_id === item.id);
  const status = itemStatus(item, assignments);
  const line = describeItem(item, people, assignments);

  const handlePersonClick = (person) => {
    const shares = itemAssignments.find((a) => a.person_id === person.id)?.share_count || 0;
    onSetShareCount(item.id, person.id, shares > 0 ? 0 : 1);
  };

  const totalPrice = parseFloat(item.price) * (item.quantity || 1);

  return (
    <div
      className={`bg-surface rounded-[18px] p-4 border-[1.5px] transition-colors duration-200 ${BORDER[status]}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-2">
        {/* Left: name + modifiers */}
        <div className="flex-1 min-w-0">
          <h3 style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</h3>
          {item.customModifiers && item.customModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.customModifiers.map((mod, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-surface-2 text-gray-400 rounded-[6px]">
                  {mod}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right: price + action buttons */}
        <div className="flex items-start shrink-0" style={{ gap: 12, marginLeft: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>${totalPrice.toFixed(2)}</div>
            {item.quantity > 1 && (
              <div style={{ color: '#A0C4DC', fontSize: 12 }}>
                ×{item.quantity} @ ${parseFloat(item.price).toFixed(2)}
              </div>
            )}
          </div>
          <div className="flex items-center" style={{ gap: 2, height: 20 }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(item); }}
              className="icon-btn"
              title="Edit item"
            >✎</button>
            <button
              onClick={e => { e.stopPropagation(); onDeleteRequest(item); }}
              className="icon-btn icon-btn--danger"
              title="Delete item"
            >✕</button>
          </div>
        </div>
      </div>

      {/* Assignment row */}
      {people.length === 0 ? (
        <div className="mt-3 text-xs text-gray-400">Add people to assign</div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {people.map((person, index) => {
            const color = AVATAR_PLAIN_COLORS[index % AVATAR_PLAIN_COLORS.length];
            const shares = itemAssignments.find((a) => a.person_id === person.id)?.share_count || 0;
            const held = shares > 0;

            return (
              <button
                key={person.id}
                onClick={() => handlePersonClick(person)}
                className={`avatar-ring relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold transition-all ${
                  held ? 'text-[#111] border-transparent' : 'bg-transparent border-[1.5px] border-[#2E5674] text-[#7AAAB8]'
                }`}
                style={held ? { background: color } : { '--avatar-color': color }}
                title={person.name}
              >
                {getInitials(person.name)}
                {shares > 1 && (
                  <span
                    className="absolute bg-accent text-black font-extrabold border-2 border-surface flex items-center justify-center rounded-full"
                    style={{ fontSize: 10, padding: '0 4px', height: 18, minWidth: 18, borderRadius: 9, bottom: -5, right: -6, pointerEvents: 'none' }}
                  >
                    ×{shares}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer: status line (room for a "Shares ›" link, wired by the Share sheet) */}
      {people.length > 0 && (
        <div className="mt-3 flex items-center justify-between" style={{ fontSize: 12 }}>
          <span className={TONE[line.tone]} data-testid="status-line">{line.text}</span>
        </div>
      )}
    </div>
  );
}
