import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the saved login token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopez_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';
export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
export const dstr = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
export const STATUS = ['Placed', 'Packed', 'Shipped', 'Delivered'];
export const PAY = [
  ['cod', 'Cash on delivery'],
  ['card', 'Credit or debit card'],
  ['bank', 'Bank transfer'],
  ['wallet', 'E-wallet'],
];
export const payName = (k) => (PAY.find((p) => p[0] === k) || [k, k])[1];

export default api;
