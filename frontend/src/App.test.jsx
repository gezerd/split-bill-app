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
  subtotal: 0,
  loading: false,
  error: null,
  handleUploadReceipt: vi.fn(),
  handleCreateItem: vi.fn(),
  handleUpdateItem: vi.fn(),
  handleDeleteItem: vi.fn(),
  handleCreatePerson: vi.fn(),
  handleDeletePerson: vi.fn(),
  handleCreateAssignment: vi.fn(),
  handleDeleteAssignment: vi.fn(),
  handleUpdateTax: vi.fn(),
  handleUpdateTip: vi.fn(),
};

function renderAtStep2(overrides) {
  useBillData.mockReturnValue({ ...baseHookReturn, ...overrides });
  render(<App />);
  fireEvent.click(screen.getByText('go-to-step-2'));
}

describe('App — Step 2 Next button gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enables Next when all items and all people are assigned', () => {
    renderAtStep2({
      items: [{ id: 'i1', name: 'Burger', price: 5, quantity: 1 }],
      people: [{ id: 'p1', name: 'Alice' }],
      assignments: [{ id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 1 }],
    });

    const nextBtn = screen.getByRole('button', { name: 'Next →' });
    expect(nextBtn).not.toBeDisabled();
  });

  it('disables Next with the correct remaining count when items are not fully assigned', () => {
    renderAtStep2({
      items: [{ id: 'i1', name: 'Burger', price: 5, quantity: 2 }],
      people: [{ id: 'p1', name: 'Alice' }],
      assignments: [{ id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 1 }],
    });

    const nextBtn = screen.getByRole('button', { name: '1 items remaining' });
    expect(nextBtn).toBeDisabled();
  });

  it('disables Next when items are fully assigned but a person has zero assignments (A1 regression)', () => {
    renderAtStep2({
      items: [{ id: 'i1', name: 'Burger', price: 5, quantity: 1 }],
      people: [
        { id: 'p1', name: 'Alice' },
        { id: 'p2', name: 'Bob' },
      ],
      assignments: [{ id: 'a1', item_id: 'i1', person_id: 'p1', share_count: 1 }],
    });

    const nextBtn = screen.getByRole('button', { name: '1 people unassigned' });
    expect(nextBtn).toBeDisabled();
  });

  it('disables Next when there are no people at all', () => {
    renderAtStep2({
      items: [],
      people: [],
      assignments: [],
    });

    const nextBtn = screen.getByRole('button', { name: '0 people unassigned' });
    expect(nextBtn).toBeDisabled();
  });
});
