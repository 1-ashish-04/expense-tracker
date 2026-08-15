import client, { setTokens, clearTokens } from './client';

export async function register({ username, email, password, confirm_password }) {
  const res = await client.post('/auth/register/', { username, email, password, confirm_password });
  return res.data;
}

export async function login({ username, password }) {
  const res = await client.post('/auth/login/', { username, password });
  setTokens({ access: res.data.access, refresh: res.data.refresh });
  return res.data;
}

export async function getProfile() {
  const res = await client.get('/auth/profile/');
  return res.data;
}

export function logout() {
  clearTokens();
}
