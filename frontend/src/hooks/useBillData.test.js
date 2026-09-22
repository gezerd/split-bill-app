import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBillData } from './useBillData';
import * as api from '../api/client';

vi.mock('../api/client');

describe('useBillData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('populates state from a successful upload', async () => {
    api.uploadReceipt.mockResolvedValue({
      bill_id: 'bill-1',
      items: [{ id: 'item-1', name: 'Burger', price: 10, quantity: 1 }],
      tax_amount: 1,
      tip_amount: 2,
      subtotal: 10,
    });

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.handleUploadReceipt(new File(['x'], 'receipt.jpg'));
    });

    expect(result.current.billId).toBe('bill-1');
    expect(result.current.items).toHaveLength(1);
    expect(result.current.tax).toBe(1);
    expect(result.current.tip).toBe(2);
    expect(result.current.subtotal).toBe(10);
    expect(result.current.error).toBeNull();
  });

  it('sets error when upload rejects', async () => {
    api.uploadReceipt.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await expect(
        result.current.handleUploadReceipt(new File(['x'], 'receipt.jpg'))
      ).rejects.toThrow('boom');
    });

    expect(result.current.error).toBe('boom');
  });

  it('replaces an existing (item, person) assignment locally instead of duplicating', async () => {
    api.createAssignment
      .mockResolvedValueOnce({ id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 1 })
      .mockResolvedValueOnce({ id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 2 });

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.handleCreateAssignment('item-1', 'p1', 1);
    });
    await act(async () => {
      await result.current.handleCreateAssignment('item-1', 'p1', 2);
    });

    expect(result.current.assignments).toHaveLength(1);
    expect(result.current.assignments[0].share_count).toBe(2);
  });

  it('prunes related assignments when an item is deleted', async () => {
    api.createAssignment.mockResolvedValue({
      id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 1,
    });
    api.deleteItem.mockResolvedValue({});

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.handleCreateAssignment('item-1', 'p1', 1);
    });
    expect(result.current.assignments).toHaveLength(1);

    await act(async () => {
      await result.current.handleDeleteItem('item-1');
    });

    expect(result.current.assignments).toHaveLength(0);
  });

  it('prunes related assignments when a person is deleted', async () => {
    api.createAssignment.mockResolvedValue({
      id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 1,
    });
    api.deletePerson.mockResolvedValue({});

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.handleCreateAssignment('item-1', 'p1', 1);
    });
    expect(result.current.assignments).toHaveLength(1);

    await act(async () => {
      await result.current.handleDeletePerson('p1');
    });

    expect(result.current.assignments).toHaveLength(0);
  });
});
