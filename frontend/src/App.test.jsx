import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useBillData } from './hooks/useBillData';

vi.mock('./hooks/useBillData');

// ReceiptUpload's own upload/timing flow isn't under test here — replace it
// with a button that jumps straight to step 2 via onDone.
vi.mock('./components/ReceiptUpload', () => ({
  default: ({ onDone }) => <button onClick={onDone}>go-to-step-2</button>,
}));

const baseHookReturn = {
  billId: 'bill-1',
  items: [],
  people: [],
  assignments: [],
  tax: 0,
  tip: 0,
  receiptSubtotal: 0,
  loading: false,
  error: null,
  itemsEdited: false,
  handleUploadReceipt: vi.fn(),
  handleStartManual: vi.fn(),
  handleReset: vi.fn(),
  handleCreateItem: vi.fn(),
  handleUpdateItem: vi.fn(),
  handleDeleteItem: vi.fn(),
  handleCreatePerson: vi.fn(),
  handleDeletePerson: vi.fn(),
  setShareCount: vi.fn(),
  handleUpdateTax: vi.fn(),
  handleUpdateTip: vi.fn(),
};

function renderAtStep2(overrides) {
  useBillData.mockReturnValue({ ...baseHookReturn, ...overrides });
  render(<App />);
  fireEvent.click(screen.getByText('go-to-step-2'));
}

describe('App — Step 2 gating and warnings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const burger = { id: 'i1', name: 'Burger', price: 5, quantity: 1 };
  const alice = { id: 'p1', name: 'Alice' };
  const holds = (itemId, personId, n = 1) => ({ id: `a-${itemId}`, item_id: itemId, person_id: personId, share_count: n });

  it('enables Next when every item has a Share', () => {
    renderAtStep2({ items: [burger], people: [alice], assignments: [holds('i1', 'p1')] });
    expect(screen.getByRole('button', { name: 'Next →' })).not.toBeDisabled();
    expect(screen.getByText('All assigned ✓')).toBeInTheDocument();
  });

  it('blocks Next with the unassigned count', () => {
    renderAtStep2({ items: [burger], people: [alice], assignments: [] });
    expect(screen.getByRole('button', { name: '1 items remaining' })).toBeDisabled();
    expect(screen.getByText('1 unassigned')).toBeInTheDocument();
  });

  it('allows Next for a partially assigned item and shows the partial pill', () => {
    renderAtStep2({
      items: [{ ...burger, quantity: 2 }],
      people: [alice],
      assignments: [holds('i1', 'p1')],
    });
    expect(screen.getByRole('button', { name: 'Next →' })).not.toBeDisabled();
    expect(screen.getByText('1 partial')).toBeInTheDocument();
  });

  it('notes an unassigned person only once every item has a Share, without blocking', () => {
    const bob = { id: 'p2', name: 'Bob' };
    renderAtStep2({ items: [burger], people: [alice, bob], assignments: [holds('i1', 'p1')] });
    expect(screen.getByText("Bob has nothing assigned — they'll owe $0.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next →' })).not.toBeDisabled();
  });

  it('hides the unassigned person note while items are unassigned', () => {
    renderAtStep2({ items: [burger], people: [alice], assignments: [] });
    expect(screen.queryByText(/nothing assigned/)).not.toBeInTheDocument();
  });

  it('disables Next with "Add people first" when there are no people', () => {
    renderAtStep2({ items: [burger], people: [], assignments: [] });
    expect(screen.getByRole('button', { name: 'Add people first' })).toBeDisabled();
  });

  it('shows the subtotal mismatch banner only with a receipt subtotal', () => {
    renderAtStep2({ items: [burger], people: [alice], receiptSubtotal: 9 });
    expect(screen.getByText(/Items add up to \$5.00, but the receipt subtotal is \$9.00/)).toBeInTheDocument();
  });

  it('skips the mismatch check without a receipt subtotal', () => {
    renderAtStep2({ items: [burger], people: [alice], receiptSubtotal: 0 });
    expect(screen.queryByText(/Items add up to/)).not.toBeInTheDocument();
  });
});
