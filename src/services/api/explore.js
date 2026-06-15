import { request } from './client';

export const explore = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/public/mentors?${query.toString()}`, { method: 'GET' });
  },
  getById: (id) => request(`/public/mentors/${id}`, { method: 'GET' }),
  getReviews: (id, page = 1, limit = 10) =>
    request(`/public/mentors/${id}/reviews?page=${page}&limit=${limit}`, { method: 'GET' }),
};
