import { request } from './client';

export const auth = {
  register: (name, email, password, role) =>
    request('/public/auth/register', { method: 'POST', body: { name, email, password, role } }),
  login: (email, password) =>
    request('/public/auth/login', { method: 'POST', body: { email, password } }),
  getMe: () => request('/private/auth/me', { method: 'GET' }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return request('/private/auth/logout', { method: 'POST' }).catch(() => {});
  },
  changePassword: (currentPassword, newPassword) =>
    request('/private/auth/change-password', { method: 'PATCH', body: { currentPassword, newPassword } }),
  updateMe: (data) =>
    request('/private/auth/me', { method: 'PATCH', body: data }),
  forgotPassword: (email) =>
    request('/public/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) =>
    request(`/public/auth/reset-password/${token}`, { method: 'POST', body: { password } }),
};
