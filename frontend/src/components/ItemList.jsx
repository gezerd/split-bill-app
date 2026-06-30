import { useState } from 'react';
import ItemCard from './ItemCard';
import ItemForm from './ItemForm';

export default function ItemList({
  items,
  people,
  assignments,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAssignmentSave,
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddItem = async (itemData) => {
    await onAddItem(itemData.name, itemData.price, itemData.quantity);
    setShowAddForm(false);
  };

  return (
    <div>
      {showAddForm && (
        <div style={{ marginBottom: 12 }}>
          <ItemForm onSubmit={handleAddItem} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No items found. Upload a receipt or add items manually.</p>
        </div>
      ) : (
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
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onAssignmentSave={onAssignmentSave}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            fontSize: 13, fontWeight: 600, color: '#7AAAB8',
            padding: '6px 12px', borderRadius: 9,
            border: '1px solid #2E5674', background: 'none',
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>
    </div>
  );
}
