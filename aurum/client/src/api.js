import axios from 'axios';

const DEFAULT_API_URL = 'http://localhost:5000/api';
const envUrl = process.env.REACT_APP_API_URL?.trim().replace(/\/\/+$|\/$/, '');
const API_URL = envUrl && !envUrl.includes('localhost:5001')
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
  : DEFAULT_API_URL;

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('aurum_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
