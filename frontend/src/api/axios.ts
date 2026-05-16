import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ai-notes-3xh2.onrender.com', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('peblo_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;