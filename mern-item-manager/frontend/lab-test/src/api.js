import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const baseURL = configuredBaseUrl || '/api';

const API = axios.create({
  baseURL,
});

export const getItems = () => API.get('/items');
export const createItem = (data) => API.post('/items', data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
