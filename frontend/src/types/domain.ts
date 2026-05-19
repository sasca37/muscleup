export type MuscleGroup = 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE';

export type User = {
  id: string;
  loginId: string;
  displayName: string;
  created: boolean;
  createdAt: string;
  lastLoginAt: string;
};

export type ExerciseMachine = {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  muscleGroupLabel: string;
  movementPattern: string;
  description: string | null;
};

export type WorkoutSet = {
  setOrder: number;
  weightKg: string;
  reps: number;
};

export type MachineHistory = {
  sessionId: number;
  recordId: number;
  workoutDate: string;
  machineName: string;
  sets: WorkoutSet[];
  note: string | null;
};

export type WorkoutSession = {
  id: number;
  workoutDate: string;
  memo: string | null;
  durationSeconds?: number;
  records: {
    id: number;
    machineId: number;
    machineName: string;
    muscleGroupLabel: string;
    note: string | null;
    sets: WorkoutSet[];
  }[];
};

export type CreateWorkoutPayload = {
  workoutDate: string;
  memo: string;
  records: {
    machineId: number;
    note: string;
    sets: {
      weightKg: number;
      reps: number;
    }[];
  }[];
};
