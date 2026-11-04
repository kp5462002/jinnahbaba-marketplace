// Centralized fetch wrapper — prepends the API base URL
// so all fetches work in both dev (Vite proxy) and production (Render URL).
//
// Usage:
//   import { apiFetch } from '../api/fetch.js';
//   const res = await apiFetch('/products?limit=12');
//   const res = await apiFetch('/cart', { method: 'POST', body: JSON.stringify({...}) });

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  return fetch(url, options);
}

export { API_BASE };
