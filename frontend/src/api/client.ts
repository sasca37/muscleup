import type {
  CreateWorkoutPayload,
  ExerciseMachine,
  MachineHistory,
  MuscleGroup,
  User,
  WorkoutSession,
} from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  loginUrl(provider: 'google' | 'kakao') {
    return `${API_BASE_URL}/oauth2/authorization/${provider}`;
  },
  me() {
    return request<User>('/api/me');
  },
  machines(muscleGroup?: MuscleGroup) {
    const query = muscleGroup ? `?muscleGroup=${muscleGroup}` : '';
    return request<ExerciseMachine[]>(`/api/machines${query}`);
  },
  machineHistory(machineId: number) {
    return request<MachineHistory[]>(`/api/machines/${machineId}/history`);
  },
  workouts() {
    return request<WorkoutSession[]>('/api/workouts');
  },
  createWorkout(payload: CreateWorkoutPayload) {
    return request<WorkoutSession>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

