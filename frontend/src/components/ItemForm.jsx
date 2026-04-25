import { useState } from 'react';

export default function ItemForm({ onSubmit, onCancel, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
      });
      // Reset form if this was a create (no initialData)
      if (!initialData) {
        setName('');
        setPrice('');
        setQuantity(1);
      }
    } catch (error) {
      console.error('Failed to submit item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-2 p-4 rounded-lg border border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div className="md:col-span-1">
          <label htmlFor="item-name" className="block text-sm font-medium text-gray-300 mb-1">
            Item Name
          </label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Burger"
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 bg-surface-2 text-gray-100 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="item-price" className="block text-sm font-medium text-gray-300 mb-1">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
            <input
              id="item-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 bg-surface-2 text-gray-100 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            id="item-quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 bg-surface-2 text-gray-100 focus:ring-primary-500"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-gray-300 hover:bg-surface-3 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim() || !price}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:bg-surface-2 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Item'}
        </button>
      </div>
    </form>
  );
}
