export const API_BASE = 'http://192.168.137.142:8080'; // On emulator use 10.0.2.2; change to backend IP as needed

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const opts = { ...options };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  opts.headers = headers;
  const res = await fetch(url, opts);
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw json || { status: res.status };
    return json;
  } catch (e) {
    throw e;
  }
}

export default request;
