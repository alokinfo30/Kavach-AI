import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { handleMockRequest } from './mockBackend';

// Allow overriding backend URL via environment variables
const metaEnv = (import.meta as any)?.env || {};
const API_BASE_URL = 
  metaEnv.VITE_API_URL || 
  metaEnv.VITE_API_BASE_URL || 
  '/api';

// Extended request config with retry parameters
export interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  retry?: boolean | number;
  retryDelay?: number;
  _startTime?: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Max automatic retries for transient failures
const DEFAULT_MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 800;

// Request interceptor: attach Authorization header and start timing
api.interceptors.request.use((config: RetryConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config._startTime = Date.now();
  return config;
});

// Helper: Determine if error is eligible for automated retry
function isRetryableError(error: AxiosError): boolean {
  // Network errors, connection aborts, or client-side timeouts
  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  // Rate limited (429) or Server side transient errors (500, 502, 503, 504, 520+)
  if (status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }

  // 404 is not a network transient glitch, but will fallback to mock
  return false;
}

// Response interceptor: Automatic Retry with Exponential Backoff + Mock Fallback
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (!config) {
      return Promise.reject(error);
    }

    // Determine configured max retries (explicitly disabled with retry: false or 0)
    const maxRetries = 
      typeof config.retry === 'number' 
        ? config.retry 
        : config.retry === false 
          ? 0 
          : DEFAULT_MAX_RETRIES;

    config._retryCount = config._retryCount || 0;

    // Check if we should retry the request
    if (config._retryCount < maxRetries && isRetryableError(error)) {
      config._retryCount += 1;
      
      // Calculate exponential backoff delay with random jitter (e.g., 800ms, 1600ms, 3200ms)
      const delay = Math.min(
        (config.retryDelay || BASE_RETRY_DELAY_MS) * Math.pow(2, config._retryCount - 1) + Math.random() * 200,
        5000
      );

      console.warn(
        `[Kavach-AI API Retry] Attempt ${config._retryCount}/${maxRetries} for "${config.url}" failed with ${
          error.response ? `HTTP ${error.response.status}` : error.message
        }. Retrying in ${Math.round(delay)}ms...`
      );

      // Dispatch global window event so UI can display retry indicators if desired
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kavach-api-retry', {
            detail: {
              url: config.url,
              attempt: config._retryCount,
              maxRetries,
              delay,
              errorStatus: error.response?.status,
            }
          })
        );
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    // If retries exhausted or 404/network failure, trigger seamless mock fallback
    const is404 = error.response && error.response.status === 404;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const isServerError = error.response && (error.response.status >= 500 && error.response.status <= 599);

    if (is404 || isNetworkError || isServerError) {
      const url = config.url || '';
      const method = config.method || 'get';
      let requestData = config.data;
      if (typeof requestData === 'string') {
        try {
          requestData = JSON.parse(requestData);
        } catch {
          // preserve string
        }
      }

      const mockResult = handleMockRequest(url, method, requestData);
      if (mockResult) {
        console.info(
          `[Kavach-AI Mock Recovery] Successfully handled "${method.toUpperCase()} ${url}" via local edge fallback engine.`
        );

        return Promise.resolve({
          data: mockResult.data,
          status: mockResult.status,
          statusText: 'OK (Edge Simulation)',
          headers: {},
          config: config,
        });
      }
    }

    return Promise.reject(error);
  }
);

// Diagnostic function: Pings the API health check endpoint and measures round-trip latency
export async function checkApiHealth(): Promise<{
  online: boolean;
  mode: 'live_server' | 'edge_simulation' | 'offline';
  latencyMs: number;
  data: any;
}> {
  const startTime = Date.now();
  try {
    const res = await api.get('/health', {
      timeout: 4000,
      headers: { 'Cache-Control': 'no-cache' }
    });
    const latencyMs = Math.max(1, Date.now() - startTime);
    const mode = res.data?.connectivity?.mode === 'client_edge_fallback' || res.statusText?.includes('Mock') 
      ? 'edge_simulation' 
      : 'live_server';

    return {
      online: true,
      mode,
      latencyMs,
      data: res.data
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      online: false,
      mode: 'offline',
      latencyMs,
      data: { error: err.message || 'Connection failed' }
    };
  }
}

export default api;
