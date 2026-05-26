import type {
  AddWorkoutRecordPayload,
  CreateCustomExercisePayload,
  ExerciseMachine,
  LoginPayload,
  MarketQuote,
  MarketWatchlist,
  MuscleGroup,
  RegisterPayload,
  StartWorkoutSessionPayload,
  User,
  WorkoutSession,
} from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? window.location.origin;

type ApiErrorResponse = {
  code: string;
  message: string;
  timestamp: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
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

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function withUser(userId: string, options?: RequestInit): RequestInit {
  return {
    ...options,
    headers: {
      'X-User-Id': userId,
      ...options?.headers,
    },
  };
}

export const api = {
  listExercises(userId?: string, muscleGroup?: MuscleGroup) {
    const query = muscleGroup ? `?muscleGroup=${encodeURIComponent(muscleGroup)}` : '';
    return request<ExerciseMachine[]>(`/api/exercises${query}`, userId ? withUser(userId) : undefined);
  },
  createCustomExercise(userId: string, payload: CreateCustomExercisePayload) {
    return request<ExerciseMachine>('/api/exercises/custom', withUser(userId, {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  },
  deleteCustomExercise(userId: string, catalogId: number) {
    return request<void>(`/api/exercises/${catalogId}`, withUser(userId, {
      method: 'DELETE',
    }));
  },
  login(payload: LoginPayload) {
    return request<User>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  register(payload: RegisterPayload) {
    return request<User>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  startWorkoutSession(userId: string, payload: StartWorkoutSessionPayload) {
    return request<WorkoutSession>('/api/workout-sessions/start', withUser(userId, {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  },
  listTodayWorkoutSessions(userId: string, date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return request<WorkoutSession[]>(`/api/workout-sessions/today${query}`, withUser(userId));
  },
  listWorkoutSessions(userId: string, limit = 30) {
    return request<WorkoutSession[]>(`/api/workout-sessions?limit=${limit}`, withUser(userId));
  },
  addWorkoutRecord(userId: string, sessionId: string, payload: AddWorkoutRecordPayload) {
    return request<WorkoutSession>(`/api/workout-sessions/${sessionId}/records`, withUser(userId, {
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  },
  finishWorkoutSession(userId: string, sessionId: string) {
    return request<WorkoutSession>(`/api/workout-sessions/${sessionId}/finish`, withUser(userId, {
      method: 'PATCH',
    }));
  },
  deleteWorkoutRecord(userId: string, sessionId: string, recordId: string) {
    return request<WorkoutSession>(`/api/workout-sessions/${sessionId}/records/${recordId}`, withUser(userId, {
      method: 'DELETE',
    }));
  },
  deleteWorkoutSession(userId: string, sessionId: string) {
    return request<void>(`/api/workout-sessions/${sessionId}`, withUser(userId, {
      method: 'DELETE',
    }));
  },
  getUsStockQuote(symbol: string) {
    return request<MarketQuote>(`/api/market/us-stocks/${encodeURIComponent(symbol)}`);
  },
  getMarketWatchlist(userId: string) {
    return request<MarketWatchlist>('/api/market/watchlist', withUser(userId));
  },
  updateMarketWatchlist(userId: string, symbols: string[]) {
    return request<MarketWatchlist>('/api/market/watchlist', withUser(userId, {
      method: 'PUT',
      body: JSON.stringify({ symbols }),
    }));
  },
  getMarketWatchlistQuotes(userId: string) {
    return request<MarketQuote[]>('/api/market/watchlist/quotes', withUser(userId));
  },
};
