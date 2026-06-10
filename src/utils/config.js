// Central configuration - update these for production deployment
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
export const API_BASE = `${BACKEND_URL}/api/v1`;
export const GOOGLE_AUTH_URL = `${BACKEND_URL}/api/v1/auth/google`;
