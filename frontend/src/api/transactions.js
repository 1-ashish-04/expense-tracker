import client from './client';

export async function listTransactions(params = {}) {
  const res = await client.get('/transactions/', { params });
  return res.data; // { count, next, previous, results }
}

export async function createTransaction(payload) {
  const res = await client.post('/transactions/', payload);
  return res.data;
}

export async function updateTransaction(id, payload) {
  const res = await client.put(`/transactions/${id}/`, payload);
  return res.data;
}

export async function deleteTransaction(id) {
  await client.delete(`/transactions/${id}/`);
}
