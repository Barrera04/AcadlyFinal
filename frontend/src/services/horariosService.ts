import { API_BASE } from './api';

export async function getAll() {
  try {
    const res = await fetch(`${API_BASE}/horarios`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getById(id: number) {
  const res = await fetch(`${API_BASE}/horarios/${id}`);
  return await res.json();
}

export async function getByCurso(cursoId: number) {
  try {
    const res = await fetch(`${API_BASE}/horarios/curso/${cursoId}`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function create(cursoId: number, payload: any) {
  const res = await fetch(`${API_BASE}/horarios/${cursoId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function update(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/horarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function remove(id: number) {
  const res = await fetch(`${API_BASE}/horarios/${id}`, { method: 'DELETE' });
  return res.ok;
}

export default { getAll, getById, getByCurso, create, update, remove };
