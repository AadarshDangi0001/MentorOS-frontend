import { request } from './client';

export const payments = {
  createOrder: (mentorId, packageId, availabilityId) =>
    request('/private/payments/create-order', { method: 'POST', body: { mentorId, packageId, availabilityId } }),
  verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature, meetingData) =>
    request('/private/payments/verify', {
      method: 'POST',
      body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, meetingData },
    }),
  cancel: (bookingId) =>
    request('/private/payments/cancel', {
      method: 'POST',
      body: { bookingId },
    }),
};
