import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Helper to extract clean error message
export const getErrorMessage = (error) => {
  if (error.response) {
    // Backend returned an error response
    if (error.response.data && error.response.data.error) {
      return error.response.data.error;
    }
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    return `Server error: ${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    // Request made but no response received
    return 'Cannot reach AgriChain backend at ' + API_BASE_URL + '. Is the Express server running on port 3000?';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

/**
 * Health check
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

/**
 * Fetch all batches from Hyperledger Fabric ledger
 */
export const getAllBatches = async () => {
  const response = await apiClient.get('/api/batches');
  // Backend returns an array or null
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.batches)) {
    return data.batches;
  }
  return [];
};

/**
 * Fetch a single batch by ID
 */
export const getBatchById = async (batchId) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.get(`/api/batches/${encodeURIComponent(batchId)}`);
  return response.data;
};

/**
 * Create a new batch on the blockchain
 * @param {Object} batchData { batchId, crop, farmer, location, quantity }
 */
export const createBatch = async (batchData) => {
  const response = await apiClient.post('/api/batches', {
    batchId: batchData.batchId?.trim(),
    crop: batchData.crop?.trim(),
    farmer: batchData.farmer?.trim(),
    location: batchData.location?.trim(),
    quantity: Number(batchData.quantity),
  });
  return response.data;
};

/**
 * Update IoT storage telemetry conditions on the blockchain
 * @param {string} batchId
 * @param {number} temperature
 * @param {number} humidity
 */
export const updateStorageConditions = async (batchId, temperature, humidity) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.put(`/api/batches/${encodeURIComponent(batchId)}/storage`, {
    temperature: Number(temperature),
    humidity: Number(humidity),
  });
  return response.data;
};

/**
 * Transfer batch custody to a new custodian and role on the blockchain
 * @param {string} batchId
 * @param {string} newCustodian
 * @param {string} newRole
 */
export const transferBatch = async (batchId, newCustodian, newRole) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.post(`/api/batches/${encodeURIComponent(batchId)}/transfer`, {
    newCustodian: String(newCustodian).trim(),
    newRole: String(newRole).trim(),
  });
  return response.data;
};

/**
 * Fetch custody timeline events for a batch from the blockchain
 * @param {string} batchId
 */
export const getCustodyHistory = async (batchId) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.get(`/api/batches/${encodeURIComponent(batchId)}/custody-history`);
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch storage condition telemetry history for a batch from the blockchain
 * @param {string} batchId
 */
export const getTelemetryHistory = async (batchId) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.get(`/api/batches/${encodeURIComponent(batchId)}/telemetry-history`);
  const data = response.data;
  return Array.isArray(data) ? data : [];
};

/**
 * Fetch crop-specific storage rules for a given crop from the blockchain
 * @param {string} crop
 */
export const getStorageRules = async (crop = 'ALL') => {
  const response = await apiClient.get(`/api/storage-rules/${encodeURIComponent(crop)}`);
  return response.data;
};

/**
 * Fetch storage rules applicable to a specific batch based on its registered crop
 * @param {string} batchId
 */
export const getBatchStorageRules = async (batchId) => {
  if (!batchId) throw new Error('Batch ID is required');
  const response = await apiClient.get(`/api/batches/${encodeURIComponent(batchId)}/storage-rules`);
  return response.data;
};

export default apiClient;


