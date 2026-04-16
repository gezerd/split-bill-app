import { useState } from 'react';
import { useBillData } from './hooks/useBillData';
import ReceiptUpload from './components/ReceiptUpload';
import ItemList from './components/ItemList';
import PeopleManager from './components/PeopleManager';
import TipTaxInput from './components/TipTaxInput';
import FinalBreakdown from './components/FinalBreakdown';
import AssignmentModal from './components/AssignmentModal';

export default function App() {
  const {
    billId,
    items,
    people,
    assignments,
    tax,
    tip,
    subtotal,
    loading,
    error,
    handleUploadReceipt,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleCreatePerson,
    handleDeletePerson,
    handleCreateAssignment,
    handleDeleteAssignment,
    handleUpdateTax,
    handleUpdateTip,
  } = useBillData();

  const [selectedItem, setSelectedItem] = useState(null);

  const handleAssignmentSave = async (itemId, selectedPeople) => {
    // First, delete existing assignments for this item
    const existingAssignments = assignments.filter((a) => a.item_id === itemId);
    for (const assignment of existingAssignments) {
      await handleDeleteAssignment(assignment.id);
    }

    // Then create new assignments
    for (const [personId, shareCount] of selectedPeople.entries()) {
      await handleCreateAssignment(itemId, personId, shareCount);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Split Bill App</h1>
          <p className="text-gray-600">
            Upload a receipt and easily split the bill among friends
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Upload Receipt */}
          {!billId && (
            <div className="bg-white rounded-lg shadow p-6">
              <ReceiptUpload onUpload={handleUploadReceipt} />
            </div>
          )}

          {/* After Upload: Show Bill Management */}
          {billId && (
            <>
              {/* Step 2: Manage People and Items Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <PeopleManager
                    people={people}
                    onAddPerson={handleCreatePerson}
                    onDeletePerson={handleDeletePerson}
                  />
                </div>

                <div className="lg:col-span-2">
                  <TipTaxInput
                    tax={tax}
                    tip={tip}
                    subtotal={subtotal}
                    onUpdateTax={handleUpdateTax}
                    onUpdateTip={handleUpdateTip}
                  />
                </div>
              </div>

              {/* Step 3: Items */}
              {items.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-medium">No items could be found from the receipt.</p>
                  <p className="text-yellow-700 text-sm mt-1">You can add items manually below.</p>
                </div>
              )}
              <ItemList
                items={items}
                people={people}
                assignments={assignments}
                onAddItem={handleCreateItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
                onAssignClick={setSelectedItem}
              />

              {/* Step 4: Final Breakdown */}
              <FinalBreakdown billId={billId} people={people} />

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Start New Bill
                </button>
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-700">Processing...</p>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedItem && (
          <AssignmentModal
            item={selectedItem}
            people={people}
            currentAssignments={assignments}
            onClose={() => setSelectedItem(null)}
            onSave={handleAssignmentSave}
          />
        )}
      </div>
    </div>
  );
}
