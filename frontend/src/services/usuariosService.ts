import { API_BASE } from './api';

export async function getAll() {
  try {
    const res = await fetch(`${API_BASE}/usuarios`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getById(id: number) {
  const res = await fetch(`${API_BASE}/usuarios/${id}`);
  return await res.json();
}

// Use auth register endpoint for creating users
export async function create(payload: { nombre: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) return { error: data?.message || data?.error || 'Error al crear usuario' };
  return data;
}

export async function update(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function remove(id: number) {
  try {
    const res = await fetch(`${API_BASE}/usuarios/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export default { getAll, getById, create, update, remove };
