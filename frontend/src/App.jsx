import { useState } from 'react';
import { useBillData } from './hooks/useBillData';
import StepIndicator from './components/StepIndicator';
import ReceiptUpload from './components/ReceiptUpload';
import ItemList from './components/ItemList';
import PeopleManager from './components/PeopleManager';
import TipTaxInput from './components/TipTaxInput';
import FinalBreakdown from './components/FinalBreakdown';

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

  const allAssigned =
    items != null &&
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
    return await handleUploadReceipt(file);
  };

  const handleUploadDone = () => setStep(2);

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
    <div className="min-h-screen bg-background" style={{ padding: '36px 20px 80px' }}>
      <div className="mx-auto" style={{ maxWidth: 760 }}>

        {/* Wordmark */}
        <div className="flex items-center gap-2.5 mb-11">
          <div className="flex items-center justify-center bg-accent" style={{ width: 34, height: 34, borderRadius: 9 }}>
            <span className="font-extrabold leading-none" style={{ fontSize: 17, color: '#111' }}>$</span>
          </div>
          <span className="font-extrabold" style={{ fontSize: 17, letterSpacing: '-0.3px' }}>splitbill</span>
        </div>

        {/* Step Indicator */}
        {billId && (
          <div className="mb-10">
            <StepIndicator currentStep={step} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <ReceiptUpload onUpload={handleUpload} onDone={handleUploadDone} />
        )}

        {/* Step 2: Assign */}
        {step === 2 && (
          <div className="fade-up">
            <h2 className="font-extrabold mb-1" style={{ fontSize: 26 }}>Who's splitting?</h2>
            <p className="text-gray-400 mb-7" style={{ fontSize: 14 }}>Add everyone, then tap each item to assign it.</p>

            <PeopleManager
              people={people}
              onAddPerson={handleCreatePerson}
              onDeletePerson={handleDeletePerson}
            />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A0C4DC', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Items from receipt
                </span>
                {items.length > 0 && (
                  allAssigned
                    ? <span className="text-accent bg-accent-dim font-semibold" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100 }}>All assigned ✓</span>
                    : <span className="text-gray-400 bg-surface-2" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100 }}>
                        {items.filter(item => {
                          const shares = assignments.filter(a => a.item_id === item.id).reduce((s, a) => s + (a.share_count || 1), 0);
                          return shares < (item.quantity || 1);
                        }).length} unassigned
                      </span>
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
                onAssignmentSave={handleAssignmentSave}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="btn-back"
                style={{
                  padding: '14px 24px', borderRadius: 14, fontSize: 14, fontWeight: 700,
                  background: '#254862', color: '#A0C4DC', transition: '0.2s',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!allAssigned || people.length === 0}
                className={`font-bold transition-all ${
                  allAssigned && people.length > 0
                    ? 'bg-accent text-on-accent accent-hover'
                    : 'bg-surface-2 text-gray-500 cursor-not-allowed'
                }`}
                style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15 }}
              >
                {!allAssigned && people.length > 0
                  ? `${items.filter(item => {
                      const shares = assignments.filter(a => a.item_id === item.id).reduce((s, a) => s + (a.share_count || 1), 0);
                      return shares < (item.quantity || 1);
                    }).length} items remaining`
                  : 'Next →'}
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
            people={people}
            tipPercentage={tipPercentage}
            onBack={() => setStep(3)}
          />
        )}

      </div>

      {/* Loading Overlay — step 1 skipped; ReceiptUpload shows its own scanning state */}
      {loading && step > 1 && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
          <div className="bg-surface rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
            <p className="text-gray-300">Processing...</p>
          </div>
        </div>
      )}

    </div>
  );
}
