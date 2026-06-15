import { request } from './client';

export const availability = {
  list: (mentorId, availableOnly = true) =>
    request(`/private/availability/${mentorId}?available=${availableOnly}`, { method: 'GET' }),
  create: (startTime, endTime) =>
    request('/private/availability', { method: 'POST', body: { startTime, endTime } }),
  delete: (slotId) =>
    request(`/private/availability/${slotId}`, { method: 'DELETE' }),
};
