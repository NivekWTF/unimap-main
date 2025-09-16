import ax from 'axios';

const { VITE_API_BASE_URL_REST: baseURL } = import.meta.env;

export const axios = ax.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axios;