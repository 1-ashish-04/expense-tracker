import client from './client';

export async function listCategories() {
  const res = await client.get('/categories/');
  return res.data.results ?? res.data;
}

export async function createCategory(payload) {
  const res = await client.post('/categories/', payload);
  return res.data;
}

export async function updateCategory(id, payload) {
  const res = await client.put(`/categories/${id}/`, payload);
  return res.data;
}

export async function deleteCategory(id) {
  await client.delete(`/categories/${id}/`);
}
