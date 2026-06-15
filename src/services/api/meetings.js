import { request } from './client';

export const meetings = {
  create: (bookingId) => request('/private/meetings/create', { method: 'POST', body: { bookingId } }),
  joinHost: (bookingId) => request(`/private/meetings/${bookingId}/join-host`, { method: 'POST' }),
  joinUser: (bookingId) => request(`/private/meetings/${bookingId}/join-user`, { method: 'POST' }),
  getByBooking: (bookingId) => request(`/private/meetings/${bookingId}`, { method: 'GET' }),
  end: (bookingId) => request(`/private/meetings/${bookingId}/end`, { method: 'POST' }),
};
