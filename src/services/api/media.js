import { request } from './client';

export const media = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request('/private/media/upload', { method: 'POST', body: formData });
  },
};
