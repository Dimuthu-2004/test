import axios from 'axios';

const API = axios.create({
baseURL: import.meta.env.VITE_API_URL || 'https://test-bbrb.vercel.app/',
});

export const getItems = () => API.get('/items');
export const createItem = (data) => API.post('/items', data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
