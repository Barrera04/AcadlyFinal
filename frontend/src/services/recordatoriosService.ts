import { API_BASE } from './api';

export async function getAll() {
  try {
    const res = await fetch(`${API_BASE}/recordatorios`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getById(id: number) {
  const res = await fetch(`${API_BASE}/recordatorios/${id}`);
  return await res.json();
}

export async function getByTarea(tareaId: number) {
  try {
    const res = await fetch(`${API_BASE}/recordatorios/tarea/${tareaId}`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function create(tareaId: number, payload: any) {
  const res = await fetch(`${API_BASE}/recordatorios/${tareaId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function update(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/recordatorios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function remove(id: number) {
  const res = await fetch(`${API_BASE}/recordatorios/${id}`, { method: 'DELETE' });
  return res.ok;
}

export default { getAll, getById, getByTarea, create, update, remove };
