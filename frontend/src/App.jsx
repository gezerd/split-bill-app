import { useState, useEffect } from 'react';
import { useBillData } from './hooks/useBillData';
import StepIndicator from './components/StepIndicator';
import ReceiptUpload from './components/ReceiptUpload';
import ItemList from './components/ItemList';
import PeopleManager from './components/PeopleManager';
import TipTaxInput from './components/TipTaxInput';
import FinalBreakdown from './components/FinalBreakdown';
import { summarize } from './lib/splitModel';
import { AVATAR_PLAIN_COLORS } from './components/PeopleManager';

export default function App() {
  const {
    billId,
    items,
    people,
    assignments,
    tax,
    tip,
    receiptSubtotal,
    itemsEdited,
    loading,
    error,
    handleUploadReceipt,
    handleStartManual,
    handleReset,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleCreatePerson,
    handleDeletePerson,
    setShareCount,
    handleUpdateTax,
    handleUpdateTip,
  } = useBillData();

  const [step, setStep] = useState(1);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  const selectedIndex = people.findIndex((p) => p.id === selectedPersonId);
  const selectedPerson = selectedIndex >= 0
    ? { ...people[selectedIndex], color: AVATAR_PLAIN_COLORS[selectedIndex % AVATAR_PLAIN_COLORS.length] }
    : null;

  const summary = summarize({ items, people, assignments, receiptSubtotal });
  const { canProceed, unassignedItems, partialItems, unassignedPeople } = summary;
  const subtotal = summary.itemsSubtotalCents / 100;
  const money = (cents) => `$${(cents / 100).toFixed(2)}`;

  const nextLabel =
    people.length === 0
      ? 'Add people first'
      : unassignedItems.length > 0
      ? `${unassignedItems.length} items remaining`
      : 'Next →';

  const unassignedNote =
    unassignedItems.length === 0 && items.length > 0 && unassignedPeople.length > 0
      ? `${unassignedPeople.map((p) => p.name.trim().split(/\s+/)[0]).join(unassignedPeople.length > 2 ? ', ' : ' & ')} ${
          unassignedPeople.length === 1 ? 'has' : 'have'
        } nothing assigned — they'll ${unassignedPeople.length === 1 ? '' : 'each '}owe $0.`
      : null;

  const tipPercentage =
    subtotal && parseFloat(subtotal) > 0 && tip && parseFloat(tip) > 0
      ? Math.round((parseFloat(tip) / parseFloat(subtotal)) * 100)
      : null;

  // Uploading over an existing bill keeps its people.
  const handleUpload = (file) => handleUploadReceipt(file, { keepPeople: true });

  // Warn before refresh/close while a bill is in progress.
  useEffect(() => {
    if (!billId) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [billId]);

  const handleNewBill = () => {
    handleReset();
    setStep(1);
  };

  const handleUploadDone = () => setStep(2);

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
          <ReceiptUpload
            onUpload={handleUpload}
            onDone={handleUploadDone}
            onManual={handleStartManual}
            hasBill={!!billId}
            needsReplaceConfirm={assignments.length > 0 || itemsEdited}
            onContinue={() => setStep(2)}
          />
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
              assignments={assignments}
              selectedPersonId={selectedPerson?.id ?? null}
              onSelectPerson={(id) => setSelectedPersonId((cur) => (cur === id ? null : id))}
            />

            {selectedPerson && (
              <div
                className="flex items-center justify-between"
                style={{
                  gap: 12, padding: '10px 14px', borderRadius: 12, marginBottom: 14, fontSize: 13,
                  background: `color-mix(in srgb, ${selectedPerson.color} 14%, transparent)`,
                  border: `1.5px solid ${selectedPerson.color}`,
                }}
              >
                <span>
                  Tapping items for <b style={{ color: selectedPerson.color }}>{selectedPerson.name}</b>. Tap a card to add them to it or take them off.
                </span>
                <button
                  onClick={() => setSelectedPersonId(null)}
                  style={{ fontWeight: 700, fontSize: 13, padding: '6px 12px', borderRadius: 9, background: selectedPerson.color, color: '#111' }}
                >
                  Done
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span style={{ fontSize: 11, fontWeight: 700, color: '#A0C4DC', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Items from receipt
                </span>
                {items.length > 0 && (
                  <div className="flex items-center gap-2">
                    {unassignedItems.length === 0
                      ? <span className="text-accent bg-accent-dim font-semibold" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100 }}>All assigned ✓</span>
                      : <span className="text-gray-400 bg-surface-2" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100 }}>{unassignedItems.length} unassigned</span>}
                    {partialItems.length > 0 && (
                      <span className="font-semibold" style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, color: '#FBBF24', background: 'rgba(251,191,36,0.12)' }}>{partialItems.length} partial</span>
                    )}
                  </div>
                )}
              </div>

              {summary.mismatch && (
                <div className="mb-3.5" role="status" style={{ background: 'rgba(251,191,36,0.12)', border: '1.5px solid #FBBF24', color: '#FBBF24', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
                  Items add up to {money(summary.itemsSubtotalCents)}, but the receipt subtotal is {money(summary.receiptCents)}. A line may be missing or misread.
                </div>
              )}

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
                onSetShareCount={setShareCount}
                selectedPerson={selectedPerson}
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
              <div className="flex items-center gap-3">
                {unassignedNote && (
                  <span className="text-gray-400" style={{ fontSize: 12 }}>{unassignedNote}</span>
                )}
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceed}
                  className={`font-bold transition-all ${
                    canProceed
                      ? 'bg-accent text-on-accent accent-hover'
                      : 'bg-surface-2 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15 }}
                >
                  {nextLabel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Tax & Tip */}
        {step === 3 && (
          <TipTaxInput
            tax={tax}
            tip={tip}
            subtotal={subtotal}
            mismatchNote={
              summary.mismatch
                ? `Items add up to ${money(summary.itemsSubtotalCents)}, but the receipt subtotal is ${money(summary.receiptCents)}.`
                : null
            }
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
            onNewBill={handleNewBill}
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
