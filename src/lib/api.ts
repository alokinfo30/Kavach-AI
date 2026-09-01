import axios from 'axios';
import { handleMockRequest } from './mockBackend';

// Allow overriding backend URL via environment variables (e.g. VITE_API_URL or VITE_API_BASE_URL)
const metaEnv = (import.meta as any)?.env || {};
const API_BASE_URL = 
  metaEnv.VITE_API_URL || 
  metaEnv.VITE_API_BASE_URL || 
  '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: automatically fallback to built-in mock engine on 404 / 502 / Network errors
// This guarantees that static deployments on Netlify, Vercel, or GitHub Pages work seamlessly!
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    const is404 = error.response && error.response.status === 404;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const isServerError = error.response && (error.response.status === 502 || error.response.status === 503);

    // If request 404s (e.g. on Netlify where backend isn't hosted) or network fails, provide mock fallback
    if (config && (is404 || isNetworkError || isServerError)) {
      const url = config.url || '';
      const method = config.method || 'get';
      let requestData = config.data;
      if (typeof requestData === 'string') {
        try {
          requestData = JSON.parse(requestData);
        } catch {
          // keep as string
        }
      }

      console.warn(`[Kavach-AI] API request to "${url}" received ${error.response?.status || 'Network Error'}. Falling back to internal static mock engine.`);
      
      const mockResult = handleMockRequest(url, method, requestData);
      if (mockResult) {
        return Promise.resolve({
          data: mockResult.data,
          status: mockResult.status,
          statusText: 'OK (Mock Fallback)',
          headers: {},
          config: config,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
