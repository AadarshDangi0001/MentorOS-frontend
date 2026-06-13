import { API_BASE } from '../utils/config';
const BASE_URL = API_BASE;

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      config.body = options.body;
    } else if (typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Auto-refresh mechanism on 401
  if (response.status === 401 && endpoint !== '/public/auth/login' && endpoint !== '/public/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const refreshRes = await fetch(`${BASE_URL}/public/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: storedRefreshToken ? JSON.stringify({ refreshToken: storedRefreshToken }) : undefined,
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.data.accessToken;
          const newRefreshToken = refreshData.data.refreshToken;
          localStorage.setItem('token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          isRefreshing = false;
          onRefreshed(newToken);
        } else {
          isRefreshing = false;
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      }
    }

    // Wait for the token refresh to complete
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        headers['Authorization'] = `Bearer ${newToken}`;
        resolve(fetch(`${BASE_URL}${endpoint}`, { ...config, headers }));
      });
    }).then((res) => handleResponse(res));
  }

  return handleResponse(response);
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMsg = data?.message || response.statusText || 'Something went wrong';
    if (data?.errors && Array.isArray(data.errors)) {
      const details = data.errors
        .map((err) => {
          if (typeof err === 'object' && err !== null) {
            return Object.entries(err)
              .map(([, msg]) => msg)
              .join(', ');
          }
          return String(err);
        })
        .filter(Boolean)
        .join('; ');
      if (details) {
        errorMsg = `${errorMsg}: ${details}`;
      }
    }
    throw new Error(errorMsg);
  }

  return data;
};

export const api = {
  auth: {
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
  },
  explore: {
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
  },
  availability: {
    list: (mentorId, availableOnly = true) =>
      request(`/private/availability/${mentorId}?available=${availableOnly}`, { method: 'GET' }),
    create: (startTime, endTime) =>
      request('/private/availability', { method: 'POST', body: { startTime, endTime } }),
    delete: (slotId) =>
      request(`/private/availability/${slotId}`, { method: 'DELETE' }),
  },
  packages: {
    list: (mentorId) => request(`/private/packages/${mentorId}`, { method: 'GET' }),
    create: (title, duration, price, description) =>
      request('/private/packages', { method: 'POST', body: { title, duration, price, description } }),
    update: (id, title, duration, price, description) =>
      request(`/private/packages/${id}`, { method: 'PUT', body: { title, duration, price, description } }),
    delete: (id) => request(`/private/packages/${id}`, { method: 'DELETE' }),
  },
  bookings: {
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
  },
  mentor: {
    getProfile: () => request('/private/mentor/profile', { method: 'GET' }),
    updateProfile: (profileData) =>
      request('/private/mentor/profile', { method: 'PUT', body: profileData }),
  },
  payments: {
    createOrder: (mentorId, packageId, availabilityId) =>
      request('/private/payments/create-order', { method: 'POST', body: { mentorId, packageId, availabilityId } }),
    verify: (razorpayOrderId, razorpayPaymentId, razorpaySignature, meetingData) =>
      request('/private/payments/verify', {
        method: 'POST',
        body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, meetingData },
      }),
  },
  admin: {
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
  },
  meetings: {
    create: (bookingId) => request('/private/meetings/create', { method: 'POST', body: { bookingId } }),
    joinHost: (bookingId) => request(`/private/meetings/${bookingId}/join-host`, { method: 'POST' }),
    joinUser: (bookingId) => request(`/private/meetings/${bookingId}/join-user`, { method: 'POST' }),
    getByBooking: (bookingId) => request(`/private/meetings/${bookingId}`, { method: 'GET' }),
    end: (bookingId) => request(`/private/meetings/${bookingId}/end`, { method: 'POST' }),
  },
  media: {
    upload: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return request('/private/media/upload', { method: 'POST', body: formData });
    },
  },
};
