import { getInitials, AVATAR_COLORS, AVATAR_COLORS_OUTLINE } from './PeopleManager';

export default function ItemCard({
  item,
  people,
  assignments,
  onEdit,
  onDeleteRequest,
  onAssignmentSave,
}) {
  const itemAssignments = assignments.filter((a) => a.item_id === item.id);
  const totalShares = itemAssignments.reduce((sum, a) => sum + (a.share_count || 1), 0);
  const isFullyAssigned = totalShares >= (item.quantity || 1);

  const handlePersonClick = async (person) => {
    const quantity = item.quantity || 1;
    const currentAssignment = itemAssignments.find((a) => a.person_id === person.id);
    const currentShares = currentAssignment?.share_count || 0;
    const otherShares = itemAssignments
      .filter((a) => a.person_id !== person.id)
      .reduce((sum, a) => sum + (a.share_count || 1), 0);
    const maxShares = quantity - otherShares;

    const newShareMap = new Map(
      itemAssignments.map((a) => [a.person_id, a.share_count || 1])
    );

    if (currentShares > 0 && currentShares >= maxShares) {
      newShareMap.delete(person.id);
    } else {
      const newShares = Math.min(currentShares + 1, maxShares);
      if (newShares === 0) return;
      newShareMap.set(person.id, newShares);
    }

    await onAssignmentSave(item.id, newShareMap);
  };

  const totalPrice = parseFloat(item.price) * (item.quantity || 1);

  return (
    <div
      className={`bg-surface rounded-[18px] p-4 border-[1.5px] transition-colors duration-200 ${
        isFullyAssigned ? 'border-accent' : 'border-border'
      }`}
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
        <div className="mt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Tap to add a share:</span>
            {totalShares > 0 && (
              <span className="text-xs text-gray-400">{totalShares} share{totalShares !== 1 ? 's' : ''}</span>
            )}
          </div>
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
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-extrabold transition-all ${
                    assigned
                      ? `${AVATAR_COLORS[colorIndex % AVATAR_COLORS.length]} text-black border-transparent`
                      : `bg-transparent border-[1.5px] ${AVATAR_COLORS_OUTLINE[colorIndex % AVATAR_COLORS_OUTLINE.length]}`
                  }`}
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
        </div>
      )}
    </div>
  );
}
