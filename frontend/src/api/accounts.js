import client from './client';

export async function listAccounts() {
  const res = await client.get('/accounts/');
  return res.data.results ?? res.data;
}

export async function createAccount(payload) {
  const res = await client.post('/accounts/', payload);
  return res.data;
}

export async function updateAccount(id, payload) {
  const res = await client.put(`/accounts/${id}/`, payload);
  return res.data;
}

export async function deleteAccount(id) {
  await client.delete(`/accounts/${id}/`);
}
