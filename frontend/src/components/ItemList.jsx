import { useState } from 'react';
import ItemCard from './ItemCard';
import ItemModal from './ItemModal';

export default function ItemList({
  items,
  people,
  assignments,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAssignmentSave,
}) {
  // modal: null | { mode: 'add' } | { mode: 'edit', item } | { mode: 'delete', item }
  const [modal, setModal] = useState(null);

  const handleAddSubmit = async (itemData) => {
    await onAddItem(itemData.name, itemData.price, itemData.quantity);
    setModal(null);
  };

  const handleEditSubmit = async (itemData) => {
    await onUpdateItem(modal.item.id, itemData);
    setModal(null);
  };

  const handleDeleteConfirm = async () => {
    await onDeleteItem(modal.item.id);
    setModal(null);
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No items found. Upload a receipt or add items manually.</p>
        </div>
      ) : null}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: 12, marginBottom: 32,
      }}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            people={people}
            assignments={assignments}
            onEdit={(item) => setModal({ mode: 'edit', item })}
            onDeleteRequest={(item) => setModal({ mode: 'delete', item })}
            onAssignmentSave={onAssignmentSave}
          />
        ))}

        {/* Dashed "Add missing item" card — always last in the grid */}
        <button className="add-item-card" onClick={() => setModal({ mode: 'add' })}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add missing item
        </button>
      </div>

      {modal && (
        modal.mode === 'add' ? (
          <ItemModal
            mode="add"
            onClose={() => setModal(null)}
            onSubmit={handleAddSubmit}
          />
        ) : modal.mode === 'edit' ? (
          <ItemModal
            mode="edit"
            item={modal.item}
            onClose={() => setModal(null)}
            onSubmit={handleEditSubmit}
          />
        ) : (
          <ItemModal
            mode="delete"
            item={modal.item}
            onClose={() => setModal(null)}
            onDelete={handleDeleteConfirm}
          />
        )
      )}
    </div>
  );
}
