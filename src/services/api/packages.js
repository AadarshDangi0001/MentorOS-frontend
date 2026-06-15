import { request } from './client';

export const packages = {
  list: (mentorId) => request(`/private/packages/${mentorId}`, { method: 'GET' }),
  create: (title, duration, price, description) =>
    request('/private/packages', { method: 'POST', body: { title, duration, price, description } }),
  update: (id, title, duration, price, description) =>
    request(`/private/packages/${id}`, { method: 'PUT', body: { title, duration, price, description } }),
  delete: (id) => request(`/private/packages/${id}`, { method: 'DELETE' }),
};
