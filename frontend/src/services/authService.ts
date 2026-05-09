import request, { API_BASE } from './api';

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return { error: data?.message || data?.error || 'Credenciales inválidas' };
    }
    return data;
  } catch (e: any) {
    return { error: e?.message || 'Network error' };
  }
}

export async function register(payload: { nombre: string; email: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) return { error: data?.message || data?.error || 'Error al registrar' };
    return data;
  } catch (e: any) {
    return { error: e?.message || 'Network error' };
  }
}
