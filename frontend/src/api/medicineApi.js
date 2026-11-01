import axios from 'axios';

// Production: same-origin (the backend serves this app). Local dev: backend on :3000.
// Override with VITE_API_URL when the API is hosted elsewhere.
const ROOT = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '')).replace(/\/+$/, '');
const API_BASE_URL = `${ROOT}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 120000 // Sepolia blocks take ~12s; writes wait for confirmation
});

export const getErrorMessage = (error) =>
  error.response?.data?.error ||
  (error.request ? `Cannot reach Medichain backend at ${API_BASE_URL}.` : error.message || 'Unexpected error');

export const checkHealth = async () => (await api.get('/health')).data;
export const getAllMedicines = async () => {
  const data = (await api.get('/medicines')).data;
  return Array.isArray(data) ? data : [];
};
export const createMedicine = async (medicine) => (await api.post('/medicines', medicine)).data;
export const verifyMedicine = async (id, payload) => (await api.post(`/medicines/${encodeURIComponent(id)}/verify`, payload)).data;
export const transferMedicine = async (id, payload) => (await api.post(`/medicines/${encodeURIComponent(id)}/transfer`, payload)).data;
export const recallMedicine = async (id, payload) => (await api.post(`/medicines/${encodeURIComponent(id)}/recall`, payload)).data;
export const reportCounterfeit = async (id, payload) => (await api.post(`/medicines/${encodeURIComponent(id)}/report-counterfeit`, payload)).data;
export const getMedicine = async (id) => (await api.get(`/medicines/${encodeURIComponent(id)}`)).data;

export default api;