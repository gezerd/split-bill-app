import { useState } from 'react';
import { useBillData } from './hooks/useBillData';
import StepIndicator from './components/StepIndicator';
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

  const [step, setStep] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const allAssigned =
    items &&
    items.length > 0 &&
    items.every((item) => {
      const itemAssignments = assignments ? assignments.filter((a) => a.item_id === item.id) : [];
      const totalShares = itemAssignments.reduce((sum, a) => sum + (a.share_count || 1), 0);
      return totalShares >= (item.quantity || 1);
    });

  const tipPercentage =
    subtotal && parseFloat(subtotal) > 0 && tip && parseFloat(tip) > 0
      ? Math.round((parseFloat(tip) / parseFloat(subtotal)) * 100)
      : null;

  const handleUpload = async (file) => {
    await handleUploadReceipt(file);
    setStep(2);
  };

  const handleAssignmentSave = async (itemId, selectedPeople) => {
    const existingAssignments = assignments.filter((a) => a.item_id === itemId);
    for (const assignment of existingAssignments) {
      await handleDeleteAssignment(assignment.id);
    }
    for (const [personId, shareCount] of selectedPeople.entries()) {
      await handleCreateAssignment(itemId, personId, shareCount);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-lg leading-none">$</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">splitbill</span>
        </div>
        {billId && (
          <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">
            Step {step} of 4
          </span>
        )}
      </header>

      {/* Step Indicator */}
      {billId && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <StepIndicator currentStep={step} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Step Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Step 1: Upload */}
        {step === 1 && (
          <ReceiptUpload onUpload={handleUpload} />
        )}

        {/* Step 2: Assign */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Who's splitting?</h1>
              <p className="text-gray-400 mt-1">Add everyone, then tap each item to assign it.</p>
            </div>

            <PeopleManager
              people={people}
              onAddPerson={handleCreatePerson}
              onDeletePerson={handleDeletePerson}
            />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                  Items from Receipt
                </span>
                {allAssigned && (
                  <span className="text-xs font-semibold text-accent">All assigned ✓</span>
                )}
              </div>

              {items.length === 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300 font-medium">No items found on the receipt.</p>
                  <p className="text-yellow-400 text-sm mt-1">Add items manually below.</p>
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
                onAssignmentSave={handleAssignmentSave}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(3)}
                disabled={!allAssigned}
                className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next: Tax &amp; Tip →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tax & Tip */}
        {step === 3 && (
          <TipTaxInput
            tax={tax}
            tip={tip}
            subtotal={subtotal}
            onUpdateTax={handleUpdateTax}
            onUpdateTip={handleUpdateTip}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {/* Step 4: Done */}
        {step === 4 && (
          <FinalBreakdown
            billId={billId}
            items={items}
            assignments={assignments}
            tipPercentage={tipPercentage}
            onBack={() => setStep(3)}
          />
        )}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
          <div className="bg-surface rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
            <p className="text-gray-300">Processing...</p>
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
  );
}
