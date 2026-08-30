import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000
});

export const fetchVillages = async () => {
  const resp = await api.get('/villages');
  return resp.data;
};

export const fetchVillageDetail = async (id) => {
  const resp = await api.get(`/villages/${id}`);
  return resp.data;
};

export const fetchActiveAlerts = async () => {
  const resp = await api.get('/alerts/active');
  return resp.data;
};

export const fetchAlertHistory = async () => {
  const resp = await api.get('/alerts/history');
  return resp.data;
};

export const fetchSensorHealth = async () => {
  const resp = await api.get('/sensors/health');
  return resp.data;
};

export const triggerManualAlert = async (payload) => {
  const resp = await api.post('/alerts/manual-trigger', payload);
  return resp.data;
};

export const triggerImdPoll = async () => {
  const resp = await axios.post('http://localhost:8001/api/v1/ingest/trigger-imd-poll');
  return resp.data;
};

export default api;
