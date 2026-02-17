import { useState, useCallback } from 'react';
import * as api from '../api/client';

export const useBillData = () => {
  const [billId, setBillId] = useState(null);
  const [items, setItems] = useState([]);
  const [people, setPeople] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload receipt
  const handleUploadReceipt = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.uploadReceipt(file);
      setBillId(data.bill_id);
      setItems(data.items || []);
      setTax(data.tax_amount || 0);
      setTip(data.tip_amount || 0);
      setSubtotal(data.subtotal || 0);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Items
  const handleCreateItem = useCallback(async (name, price, quantity = 1) => {
    if (!billId) return;
    setLoading(true);
    try {
      const newItem = await api.createItem(billId, name, price, quantity);
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
      const updatedItem = await api.updateItem(itemId, updates);
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
    setLoading(true);
    try {
      const newPerson = await api.createPerson(billId, name);
      setPeople((prev) => [...prev, newPerson]);
      return newPerson;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [billId]);

  const handleUpdatePerson = useCallback(async (personId, name) => {
    setLoading(true);
    try {
      const updatedPerson = await api.updatePerson(personId, name);
      setPeople((prev) =>
        prev.map((person) => (person.id === personId ? updatedPerson : person))
      );
      return updatedPerson;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeletePerson = useCallback(async (personId) => {
    setLoading(true);
    try {
      await api.deletePerson(personId);
      setPeople((prev) => prev.filter((person) => person.id !== personId));
      // Remove assignments for this person
      setAssignments((prev) => prev.filter((a) => a.person_id !== personId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assignments
  const handleCreateAssignment = useCallback(async (itemId, personId, shareCount = 1) => {
    setLoading(true);
    try {
      const newAssignment = await api.createAssignment(itemId, personId, shareCount);
      setAssignments((prev) => {
        // Remove existing assignment if it exists, then add new one
        const filtered = prev.filter(
          (a) => !(a.item_id === itemId && a.person_id === personId)
        );
        return [...filtered, newAssignment];
      });
      return newAssignment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteAssignment = useCallback(async (assignmentId) => {
    setLoading(true);
    try {
      await api.deleteAssignment(assignmentId);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    subtotal,
    loading,
    error,
    handleUploadReceipt,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    handleCreatePerson,
    handleUpdatePerson,
    handleDeletePerson,
    handleCreateAssignment,
    handleDeleteAssignment,
    handleUpdateTax,
    handleUpdateTip,
  };
};
