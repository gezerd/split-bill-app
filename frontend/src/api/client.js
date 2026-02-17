import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bills API
export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/bills/upload-receipt', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getBill = async (billId) => {
  const response = await apiClient.get(`/api/bills/${billId}`);
  return response.data;
};

export const updateTip = async (billId, tipAmount) => {
  const response = await apiClient.put(`/api/bills/${billId}/tip`, null, {
    params: { tip_amount: tipAmount },
  });
  return response.data;
};

export const updateTax = async (billId, taxAmount) => {
  const response = await apiClient.put(`/api/bills/${billId}/tax`, null, {
    params: { tax_amount: taxAmount },
  });
  return response.data;
};

export const getBreakdown = async (billId) => {
  const response = await apiClient.get(`/api/bills/${billId}/breakdown`);
  return response.data;
};

// Items API
export const createItem = async (billId, name, price, quantity = 1) => {
  const response = await apiClient.post('/api/items', {
    bill_id: billId,
    name,
    price,
    quantity,
  });
  return response.data;
};

export const getItems = async (billId) => {
  const response = await apiClient.get('/api/items', {
    params: { bill_id: billId },
  });
  return response.data;
};

export const updateItem = async (itemId, updates) => {
  const response = await apiClient.put(`/api/items/${itemId}`, updates);
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await apiClient.delete(`/api/items/${itemId}`);
  return response.data;
};

// People API
export const createPerson = async (billId, name) => {
  const response = await apiClient.post('/api/people', {
    bill_id: billId,
    name,
  });
  return response.data;
};

export const getPeople = async (billId) => {
  const response = await apiClient.get('/api/people', {
    params: { bill_id: billId },
  });
  return response.data;
};

export const updatePerson = async (personId, name) => {
  const response = await apiClient.put(`/api/people/${personId}`, { name });
  return response.data;
};

export const deletePerson = async (personId) => {
  const response = await apiClient.delete(`/api/people/${personId}`);
  return response.data;
};

// Assignments API
export const createAssignment = async (itemId, personId, shareCount = 1) => {
  const response = await apiClient.post('/api/assignments', {
    item_id: itemId,
    person_id: personId,
    share_count: shareCount,
  });
  return response.data;
};

export const getAssignments = async (billId) => {
  const response = await apiClient.get('/api/assignments', {
    params: { bill_id: billId },
  });
  return response.data;
};

export const deleteAssignment = async (assignmentId) => {
  const response = await apiClient.delete(`/api/assignments/${assignmentId}`);
  return response.data;
};
