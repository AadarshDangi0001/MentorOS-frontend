import { request } from './client';

export const bookings = {
  getStudentBookings: () => request('/private/bookings/my', { method: 'GET' }),
  getMentorBookings: () => request('/private/bookings/mentor', { method: 'GET' }),
  getById: (id) => request(`/private/bookings/${id}`, { method: 'GET' }),
  requestReschedule: (bookingId, reason, newAvailabilityId) =>
    request(`/private/bookings/${bookingId}/reschedule`, {
      method: 'POST',
      body: { reason, newAvailabilityId },
    }),
  acceptReschedule: (bookingId) =>
    request(`/private/bookings/${bookingId}/accept-reschedule`, { method: 'POST' }),
  rejectReschedule: (bookingId) =>
    request(`/private/bookings/${bookingId}/reject-reschedule`, { method: 'POST' }),
  cancel: (bookingId) =>
    request(`/private/bookings/${bookingId}/cancel`, { method: 'POST' }),
};
