import { request } from './client';

export const admin = {
  getStats: () => request('/private/admin/stats', { method: 'GET' }),
  listUsers: (page = 1, limit = 20) =>
    request(`/private/admin/users?page=${page}&limit=${limit}`, { method: 'GET' }),
  listMentors: (page = 1, limit = 20) =>
    request(`/private/admin/mentors?page=${page}&limit=${limit}`, { method: 'GET' }),
  blockUser: (id) =>
    request(`/private/admin/users/${id}/block`, { method: 'PATCH' }),
  unblockUser: (id, role) =>
    request(`/private/admin/users/${id}/unblock`, { method: 'PATCH', body: { role } }),
  deleteUser: (id) =>
    request(`/private/admin/users/${id}/delete`, { method: 'PATCH' }),
  approveMentor: (userId) =>
    request(`/private/admin/mentors/${userId}/approve`, { method: 'PATCH' }),
  rejectMentor: (userId) =>
    request(`/private/admin/mentors/${userId}/reject`, { method: 'PATCH' }),
  changeRole: (id, role) =>
    request(`/private/admin/users/${id}/role`, { method: 'PATCH', body: { role } }),
  createMentor: (data) =>
    request('/private/admin/mentors', { method: 'POST', body: data }),
};
