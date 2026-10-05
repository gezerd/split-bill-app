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
    expect(result.current.receiptSubtotal).toBe(10);
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

  it('clears people and assignments from the previous bill on re-upload', async () => {
    api.uploadReceipt
      .mockResolvedValueOnce({ bill_id: 'bill-1', items: [{ id: 'item-1' }] })
      .mockResolvedValueOnce({ bill_id: 'bill-2', items: [{ id: 'item-2' }] });
    api.createPerson.mockResolvedValue({ id: 'p1', name: 'Ann', bill_id: 'bill-1' });
    api.createAssignment.mockResolvedValue({
      id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 1,
    });

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.handleUploadReceipt(new File(['x'], 'receipt.jpg'));
    });
    await act(async () => {
      await result.current.handleCreatePerson('Ann');
    });
    await act(async () => {
      await result.current.setShareCount('item-1', 'p1', 1);
    });
    await act(async () => {
      await result.current.handleUploadReceipt(new File(['y'], 'receipt2.jpg'));
    });

    expect(result.current.billId).toBe('bill-2');
    expect(result.current.people).toEqual([]);
    expect(result.current.assignments).toEqual([]);
  });

  it('updates screen state immediately, before the server answers', async () => {
    let resolve;
    api.createAssignment.mockReturnValue(new Promise((r) => { resolve = r; }));

    const { result } = renderHook(() => useBillData());

    let pending;
    act(() => { pending = result.current.setShareCount('item-1', 'p1', 2); });

    expect(result.current.assignments).toHaveLength(1);
    expect(result.current.assignments[0].share_count).toBe(2);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      resolve({ id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 2 });
      await pending;
    });
    expect(result.current.assignments).toEqual([
      { id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 2 },
    ]);
  });

  it('applies rapid writes for a pair in order and deletes the remembered id', async () => {
    const calls = [];
    api.createAssignment.mockImplementation(async (i, p, c) => {
      calls.push(['up', c]);
      return { id: 'a1', item_id: i, person_id: p, share_count: c };
    });
    api.deleteAssignment.mockImplementation(async (id) => { calls.push(['del', id]); });

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      result.current.setShareCount('item-1', 'p1', 1);
      result.current.setShareCount('item-1', 'p1', 0);
      result.current.setShareCount('item-1', 'p1', 1);
      await result.current.setShareCount('item-1', 'p1', 0);
    });

    expect(calls).toEqual([['up', 1], ['del', 'a1'], ['up', 1], ['del', 'a1']]);
    expect(result.current.assignments).toEqual([]);
  });

  it('sets the error and re-fetches assignments when a write fails', async () => {
    api.uploadReceipt.mockResolvedValue({ bill_id: 'bill-1', items: [] });
    api.createAssignment.mockRejectedValue(new Error('nope'));
    api.getAssignments.mockResolvedValue([]);

    const { result } = renderHook(() => useBillData());
    await act(async () => {
      await result.current.handleUploadReceipt(new File(['x'], 'r.jpg'));
    });
    await act(async () => {
      await result.current.setShareCount('item-1', 'p1', 1);
    });

    expect(result.current.error).toBe('nope');
    expect(api.getAssignments).toHaveBeenCalledWith('bill-1');
    expect(result.current.assignments).toEqual([]);
  });

  it('prunes related assignments when an item is deleted', async () => {
    api.createAssignment.mockResolvedValue({
      id: 'a1', item_id: 'item-1', person_id: 'p1', share_count: 1,
    });
    api.deleteItem.mockResolvedValue({});

    const { result } = renderHook(() => useBillData());

    await act(async () => {
      await result.current.setShareCount('item-1', 'p1', 1);
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
      await result.current.setShareCount('item-1', 'p1', 1);
    });
    expect(result.current.assignments).toHaveLength(1);

    await act(async () => {
      await result.current.handleDeletePerson('p1');
    });

    expect(result.current.assignments).toHaveLength(0);
  });
});
