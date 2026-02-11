import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentel_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rentel_token');
      localStorage.removeItem('rentel_user');
      window.dispatchEvent(new Event('rentel_logout'));
    }
    return Promise.reject(err);
  }
);

export default client;
