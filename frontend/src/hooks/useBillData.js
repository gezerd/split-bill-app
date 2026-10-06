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
  // True once an Item has been added, edited or deleted on the current bill.
  const [itemsEdited, setItemsEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Server assignment ids per (item, person) pair, and the per-pair write chains.
  const assignmentIds = useRef(new Map());
  const writeChains = useRef(new Map());
  const pairKey = (itemId, personId) => `${itemId}:${personId}`;

  // Swap in a freshly created bill (upload or manual). People and assignments
  // belong to the previous bill on the backend, so they start over unless the
  // caller re-creates the people on the new bill.
  const adoptBill = (data, newPeople = []) => {
    setBillId(data.bill_id);
    setItems(data.items || []);
    setPeople(newPeople);
    setAssignments([]);
    setTax(data.tax_amount || 0);
    setTip(data.tip_amount || 0);
    setReceiptSubtotal(data.subtotal || 0);
    setItemsEdited(false);
    assignmentIds.current.clear();
    writeChains.current.clear();
  };

  const recreatePeople = (newBillId, names) =>
    Promise.all(names.map((n) => api.createPerson(newBillId, n)));

  // Upload receipt. keepPeople re-creates the current people on the new bill.
  const handleUploadReceipt = useCallback(async (file, { keepPeople = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadReceipt(file);
      const kept = keepPeople ? await recreatePeople(data.bill_id, people.map((p) => p.name)) : [];
      adoptBill(data, kept);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [people]);

  // Start an empty bill for manual entry
  const handleStartManual = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createBill();
      adoptBill(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset to a blank slate, in place (no reload)
  const handleReset = useCallback(() => {
    setBillId(null);
    setItems([]);
    setPeople([]);
    setAssignments([]);
    setTax(0);
    setTip(0);
    setReceiptSubtotal(0);
    setItemsEdited(false);
    setError(null);
    assignmentIds.current.clear();
    writeChains.current.clear();
  }, []);

  // Items
  const handleCreateItem = useCallback(async (name, price, quantity = 1, customModifiers = []) => {
    if (!billId) return;
    setLoading(true);
    try {
      const newItem = await api.createItem(billId, name, price, quantity, customModifiers);
      setItems((prev) => [...prev, newItem]);
      setItemsEdited(true);
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
      setItemsEdited(true);
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
      setItemsEdited(true);
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
    handleUpdatePerson,
    handleDeletePerson,
    setShareCount,
    handleUpdateTax,
    handleUpdateTip,
  };
};
