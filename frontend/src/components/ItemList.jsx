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
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
        >
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4">
          <ItemForm onSubmit={handleAddItem} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No items found. Upload a receipt or add items manually.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
