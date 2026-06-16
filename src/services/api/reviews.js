import { request } from './client';

export const reviews = {
  submit: (bookingId, rating, review) =>
    request('/private/reviews', {
      method: 'POST',
      body: { bookingId, rating, review },
    }),
};
