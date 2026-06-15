import { request } from './client';

export const mentor = {
  getProfile: () => request('/private/mentor/profile', { method: 'GET' }),
  updateProfile: (profileData) =>
    request('/private/mentor/profile', { method: 'PUT', body: profileData }),
};
