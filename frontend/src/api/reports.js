import client from './client';

export async function getSummary() {
  const res = await client.get('/reports/summary/');
  return res.data;
}

export async function getCategoryBreakdown() {
  const res = await client.get('/reports/categories/');
  return res.data;
}

export async function getMonthlyReport() {
  const res = await client.get('/reports/monthly/');
  return res.data;
}
