import { useState, useCallback, useRef } from 'react';
import * as api from '../api/client';

export const useBillData = () => {
  const [billId, setBillId] = useState(null);
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [receiptSubtotal, setReceiptSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Server assignment ids per (item, person) pair, and the per-pair write chains.
  const assignmentIds = useRef(new Map());
  const writeChains = useRef(new Map());
  const pairKey = (itemId, personId) => `${itemId}:${personId}`;

  // Upload receipt
  const handleUploadReceipt = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadReceipt(file);
      setBillId(data.bill_id);
      setItems(data.items || []);
      // A new upload is a new bill — people/assignments from the previous bill
      // belong to it on the backend and would be rejected against the new items.
      setPeople([]);
      setAssignments([]);
      setTax(data.tax_amount || 0);
      setTip(data.tip_amount || 0);
      setReceiptSubtotal(data.subtotal || 0);
      assignmentIds.current.clear();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Items
  const handleCreateItem = useCallback(async (name, price, quantity = 1, customModifiers = []) => {
    if (!billId) return;
    setLoading(true);
    try {
      const newItem = await api.createItem(billId, name, price, quantity, customModifiers);
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [billId]);

  const handleUpdateItem = useCallback(async (itemId, updates) => {
    setLoading(true);
    try {
      const { customModifiers, ...rest } = updates;
      const payload = customModifiers === undefined ? rest : { ...rest, custom_modifiers: customModifiers };
      const updatedItem = await api.updateItem(itemId, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? updatedItem : item))
      );
      return updatedItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteItem = useCallback(async (itemId) => {
    setLoading(true);
    try {
      await api.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      // Remove assignments for this item
      setAssignments((prev) => prev.filter((a) => a.item_id !== itemId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // People
  const handleCreatePerson = useCallback(async (name) => {
    if (!billId) return;
    try {
      const newPerson = await api.createPerson(billId, name);
      setPeople((prev) => [...prev, newPerson]);
      return newPerson;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [billId]);

  const handleUpdatePerson = useCallback(async (personId, name) => {
    try {
      const updatedPerson = await api.updatePerson(personId, name);
      setPeople((prev) =>
        prev.map((person) => (person.id === personId ? updatedPerson : person))
      );
      return updatedPerson;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const handleDeletePerson = useCallback(async (personId) => {
    try {
      await api.deletePerson(personId);
      setPeople((prev) => prev.filter((person) => person.id !== personId));
      // Remove assignments for this person
      setAssignments((prev) => prev.filter((a) => a.person_id !== personId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Assignments: optimistic, and writes for one (item, person) pair are chained
  // so they reach the server in order. No loading overlay.
  const setShareCount = useCallback((itemId, personId, count) => {
    const key = pairKey(itemId, personId);

    setAssignments((prev) => {
      const rest = prev.filter((a) => !(a.item_id === itemId && a.person_id === personId));
      if (count <= 0) return rest;
      const existing = prev.find((a) => a.item_id === itemId && a.person_id === personId);
      return [...rest, { ...existing, item_id: itemId, person_id: personId, share_count: count }];
    });

    const write = async () => {
      if (count > 0) {
        const saved = await api.createAssignment(itemId, personId, count);
        assignmentIds.current.set(key, saved.id);
        setAssignments((prev) =>
          prev.map((a) =>
            a.item_id === itemId && a.person_id === personId ? { ...a, id: saved.id } : a
          )
        );
      } else {
        const id = assignmentIds.current.get(key);
        if (id) await api.deleteAssignment(id);
        assignmentIds.current.delete(key);
      }
    };

    const chain = (writeChains.current.get(key) || Promise.resolve())
      .then(write)
      .catch(async (err) => {
        setError(err.message);
        try {
          const fresh = await api.getAssignments(billId);
          assignmentIds.current = new Map(
            fresh.map((a) => [pairKey(a.item_id, a.person_id), a.id])
          );
          setAssignments(fresh);
        } catch {
          // keep the error from the failed write
        }
      });
    writeChains.current.set(key, chain);
    return chain;
  }, [billId]);

  // Tax and Tip
  const handleUpdateTax = useCallback(async (taxAmount) => {
    if (!billId) return;
    setLoading(true);
    try {
      await api.updateTax(billId, taxAmount);
      setTax(taxAmount);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [billId]);

  const handleUpdateTip = useCallback(async (tipAmount) => {
    if (!billId) return;
    setLoading(true);
    try {
      await api.updateTip(billId, tipAmount);
      setTip(tipAmount);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [billId]);

  return {
    billId,
    items,
    people,
    assignments,
    tax,
    tip,
    receiptSubtotal,
    loading,
    error,
    handleUploadReceipt,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleCreatePerson,
    handleUpdatePerson,
    handleDeletePerson,
    setShareCount,
    handleUpdateTax,
    handleUpdateTip,
  };
};
