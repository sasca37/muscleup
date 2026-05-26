export type MuscleGroup = 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE';
export type WorkoutGoal = 'DIET' | 'MUSCLE_GAIN' | 'HEALTH';
export type Gender = 'MALE' | 'FEMALE';
export type AgeGroup =
  | 'AGE_10S'
  | 'AGE_20S'
  | 'AGE_30S'
  | 'AGE_40S'
  | 'AGE_50S'
  | 'AGE_60S'
  | 'AGE_70S'
  | 'AGE_80S'
  | 'AGE_90S';

export type User = {
  id: string;
  email: string;
  loginId: string;
  nickname: string;
  displayName: string;
  workoutGoal: WorkoutGoal;
  gender: Gender;
  ageGroup: AgeGroup;
  created: boolean;
  createdAt: string;
  lastLoginAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  nickname: string;
  workoutGoal: WorkoutGoal;
  gender: Gender;
  ageGroup: AgeGroup;
};

export type ExerciseMachine = {
  id: number;
  mongoId?: string;
  name: string;
  muscleGroup: MuscleGroup;
  muscleGroupLabel: string;
  movementPattern: string;
  description: string | null;
  custom?: boolean;
  deletable?: boolean;
};

export type WorkoutSet = {
  setOrder: number;
  weightKg: string | number;
  reps: number;
  completed?: boolean;
};

export type MachineHistory = {
  sessionId: string;
  recordId: string;
  workoutDate: string;
  machineName: string;
  sets: WorkoutSet[];
  note: string | null;
};

export type WorkoutSession = {
  id: string;
  userId?: string;
  workoutDate: string;
  status?: 'IN_PROGRESS' | 'FINISHED';
  startedAt?: string;
  finishedAt?: string | null;
  memo: string | null;
  durationSeconds?: number;
  records: {
    id: string;
    recordId?: string;
    machineId: number;
    machineName: string;
    catalogId?: number;
    exerciseName?: string;
    muscleGroup?: MuscleGroup;
    muscleGroupLabel: string;
    movementPattern?: string;
    note: string | null;
    sets: WorkoutSet[];
    createdAt?: string;
  }[];
};

export type StartWorkoutSessionPayload = {
  workoutDate?: string;
  memo?: string;
};

export type AddWorkoutRecordPayload = {
  catalogId: number;
  note?: string;
  sets: {
    setOrder?: number;
    weightKg: number;
    reps: number;
    completed?: boolean;
  }[];
};

export type CreateCustomExercisePayload = {
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern?: string;
  description?: string;
};

export type MarketQuote = {
  symbol: string;
  name: string;
  exchangeCode: string;
  last: string;
  price: number | null;
  diff: string | null;
  rate: string | null;
  volume: string | null;
  fetchedAt: string;
};
