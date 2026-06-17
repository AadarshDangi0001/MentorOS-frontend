import axios from 'axios';
import { API_BASE } from '../../utils/config';

const BASE_URL = API_BASE;

export const apiInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request Interceptor to attach JWT
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb.success(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error) {
  refreshSubscribers.forEach((cb) => cb.failure(error));
  refreshSubscribers = [];
}

// Response Interceptor
apiInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url &&
      (originalRequest.url.endsWith('/public/auth/login') ||
       originalRequest.url.endsWith('/public/auth/refresh'));

    // Check if error is 401 and we are not trying to log in or refresh token
    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthRoute &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const storedRefreshToken = localStorage.getItem('refreshToken');
          const refreshRes = await axios.post(
            `${BASE_URL}/public/auth/refresh`,
            { refreshToken: storedRefreshToken || undefined },
            {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            }
          );

          if (refreshRes.status === 200 && refreshRes.data?.success) {
            const newToken = refreshRes.data.data.accessToken;
            const newRefreshToken = refreshRes.data.data.refreshToken;
            localStorage.setItem('token', newToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            isRefreshing = false;
            onRefreshed(newToken);

            // Retry original request
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiInstance(originalRequest);
          } else {
            throw new Error('Session expired');
          }
        } catch (err) {
          onRefreshFailed(err);
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          return Promise.reject(err);
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh({
            success: (newToken) => {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(apiInstance(originalRequest));
            },
            failure: (err) => {
              reject(err);
            },
          });
        });
      }
    }

    // Format non-401 errors nicely (matching handleResponse formatting)
    const data = error.response?.data;
    let errorMsg = data?.message || error.response?.statusText || error.message || 'Something went wrong';
    if (data?.errors && Array.isArray(data.errors)) {
      const details = data.errors
        .map((err) => {
          if (typeof err === 'object' && err !== null) {
            return Object.entries(err)
              .map(([, msg]) => msg)
              .join(', ');
          }
          return String(err);
        })
        .filter(Boolean)
        .join('; ');
      if (details) {
        errorMsg = `${errorMsg}: ${details}`;
      }
    }
    return Promise.reject(new Error(errorMsg));
  }
);

export const request = async (endpoint, options = {}) => {
  const { method = 'GET', body, headers = {} } = options;

  const config = {
    method,
    url: endpoint,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    if (body instanceof FormData) {
      config.data = body;
      // Let Axios automatically set boundary for FormData by deleting content-type
      delete config.headers['Content-Type'];
    } else {
      config.data = body;
    }
  }

  return apiInstance(config);
};
