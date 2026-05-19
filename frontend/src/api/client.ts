import type { User } from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? window.location.origin;

type ApiErrorResponse = {
  code: string;
  message: string;
  timestamp: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const error = (await response.json()) as ApiErrorResponse;
      message = error.message || message;
    } catch {
      // Use the fallback message when the backend returns no JSON body.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  login(loginId: string) {
    return request<User>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ loginId }),
    });
  },
};
