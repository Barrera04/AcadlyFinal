import { API_BASE } from './api';

export async function getAll() {
  try {
    const res = await fetch(`${API_BASE}/cursos`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function getById(id: number) {
  const res = await fetch(`${API_BASE}/cursos/${id}`);
  return await res.json();
}

export async function getByUsuario(usuarioId: number) {
  try {
    const res = await fetch(`${API_BASE}/cursos/usuario/${usuarioId}`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function create(usuarioId: number, payload: any) {
  const res = await fetch(`${API_BASE}/cursos/${usuarioId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function update(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/cursos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function remove(id: number) {
  const res = await fetch(`${API_BASE}/cursos/${id}`, { method: 'DELETE' });
  return res.ok;
}

export default { getAll, getById, getByUsuario, create, update, remove };
