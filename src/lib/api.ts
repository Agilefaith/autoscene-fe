import { getAccessToken } from '@/lib/supabase';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}

export async function authedJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authedFetch(path, init);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
