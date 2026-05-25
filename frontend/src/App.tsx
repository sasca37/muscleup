import {
  Activity,
  CalendarDays,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  History,
  LogOut,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Timer,
  Trophy,
  Trash2,
  UserRound,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import { LoginGate } from './components/LoginGate';
import { TradingViewChart } from './components/TradingViewChart';
import { muscleGroups } from './data/muscleGroups';
import { mockMachines } from './data/mockMachines';
import type {
  ExerciseMachine,
  MachineHistory,
  MuscleGroup,
  User,
  WorkoutSession,
} from './types/domain';

type DraftSet = {
  id: number;
  weightKg: string;
  reps: string;
  completed: boolean;
  remainingSeconds: number;
};

type ActiveView = 'home' | 'planner' | 'record' | 'history' | 'oneRm' | 'activity' | 'summary';
type OneRmLift = 'squat' | 'benchPress' | 'deadlift' | 'overheadPress';
type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
type TrainingGoal = 'strength' | 'hypertrophy' | 'balanced';
type SplitType = 'fullBody' | 'upperLower' | 'pushPullLegs' | 'bodyPart';
type RecordVisualMode = 'body' | 'market';

type RoutineDay = {
  dayLabel: string;
  title: string;
  focus: string;
  groups: MuscleGroup[];
  exercises: string[];
  prescription: string;
};

type ActiveWorkoutRecord = {
  id: string;
  machineName: string;
  muscleGroupLabel: string;
  setsCount: number;
  sets: {
    weightKg: string | number;
    reps: number;
  }[];
  workoutDate: string;
};

const today = new Date().toISOString().slice(0, 10);
const mockSessionKey = 'repick-mock-session';
const legacyMockSessionKey = 'muscle-log-mock-session';
const restDurationKey = 'repick-rest-duration';
const defaultRestSeconds = 60;
const minRestSeconds = 10;
const maxRestSeconds = 300;
const oneRmExercises: { value: OneRmLift; label: string }[] = [
  { value: 'squat', label: '스쿼트' },
  { value: 'benchPress', label: '벤치프레스' },
  { value: 'deadlift', label: '데드리프트' },
  { value: 'overheadPress', label: '오버헤드프레스' },
];
const trainingLevelOptions: { value: TrainingLevel; label: string; description: string }[] = [
  { value: 'beginner', label: '입문', description: '기본 패턴과 회복 여유를 우선합니다.' },
  { value: 'intermediate', label: '중급', description: '볼륨과 강도를 균형 있게 가져갑니다.' },
  { value: 'advanced', label: '상급', description: '분할 집중도와 보조 운동을 늘립니다.' },
];
const trainingGoalOptions: { value: TrainingGoal; label: string }[] = [
  { value: 'strength', label: '근력' },
  { value: 'hypertrophy', label: '근비대' },
  { value: 'balanced', label: '균형' },
];
const splitOptions: { value: SplitType; label: string; description: string }[] = [
  { value: 'fullBody', label: '전신', description: '매 회차 전신을 가볍게 순환' },
  { value: 'upperLower', label: '상하체', description: '상체와 하체를 번갈아 진행' },
  { value: 'pushPullLegs', label: 'PPL', description: '밀기, 당기기, 하체로 분리' },
  { value: 'bodyPart', label: '부위별', description: '하루 한두 부위에 집중' },
];
const priorityGroupOptions: { value: MuscleGroup; label: string }[] = [
  { value: 'CHEST', label: '가슴' },
  { value: 'BACK', label: '등' },
  { value: 'LEGS', label: '하체' },
  { value: 'SHOULDERS', label: '어깨' },
  { value: 'ARMS', label: '팔' },
  { value: 'CORE', label: '복근' },
];
const marketSymbolOptions = [
  { value: 'NASDAQ:INTC', label: '인텔' },
  { value: 'NASDAQ:AMD', label: 'AMD' },
  { value: 'NASDAQ:ARM', label: 'ARM' },
  { value: 'NASDAQ:MU', label: '마이크론' },
  { value: 'KRX:005930', label: '삼성전자' },
  { value: 'KRX:000660', label: '하이닉스' },
  { value: 'NASDAQ:SNDK', label: '샌디스크' },
];
const weekLabels = ['월', '화', '수', '목', '금', '토', '일'];
const splitTemplates: Record<SplitType, { title: string; groups: MuscleGroup[] }[]> = {
  fullBody: [
    { title: '전신 A', groups: ['CHEST', 'BACK', 'LEGS', 'CORE'] },
    { title: '전신 B', groups: ['BACK', 'SHOULDERS', 'LEGS', 'ARMS'] },
    { title: '전신 C', groups: ['CHEST', 'BACK', 'LEGS', 'SHOULDERS'] },
  ],
  upperLower: [
    { title: '상체', groups: ['CHEST', 'BACK', 'SHOULDERS', 'ARMS'] },
    { title: '하체', groups: ['LEGS', 'CORE'] },
  ],
  pushPullLegs: [
    { title: 'Push', groups: ['CHEST', 'SHOULDERS', 'ARMS'] },
    { title: 'Pull', groups: ['BACK', 'ARMS', 'CORE'] },
    { title: 'Legs', groups: ['LEGS', 'CORE'] },
  ],
  bodyPart: [
    { title: '가슴 집중', groups: ['CHEST', 'ARMS'] },
    { title: '등 집중', groups: ['BACK', 'CORE'] },
    { title: '하체 집중', groups: ['LEGS'] },
    { title: '어깨 집중', groups: ['SHOULDERS', 'ARMS'] },
    { title: '코어 보강', groups: ['CORE', 'BACK'] },
  ],
};

function createDraftSet(): DraftSet {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    weightKg: '',
    reps: '',
    completed: false,
    remainingSeconds: 0,
  };
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}초`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  return `${minutes}분`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatWorkoutDateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatWorkoutSetSummary(sets: ActiveWorkoutRecord['sets']) {
  if (sets.length === 0) {
    return '세트 기록 없음';
  }

  return sets.map((set) => `${set.weightKg}kg x ${set.reps}회`).join(' / ');
}

function getSessionStats(session: WorkoutSession | null) {
  if (!session) {
    return {
      exerciseCount: 0,
      setCount: 0,
      volume: 0,
      parts: [] as string[],
    };
  }

  const setCount = session.records.reduce((total, record) => total + record.sets.length, 0);
  const volume = session.records.reduce(
    (sessionTotal, record) =>
      sessionTotal + record.sets.reduce((setTotal, set) => setTotal + Number(set.weightKg) * set.reps, 0),
    0,
  );

  return {
    exerciseCount: session.records.length,
    setCount,
    volume,
    parts: Array.from(new Set(session.records.map((record) => record.muscleGroupLabel).filter(Boolean))),
  };
}

function getPrescription(goal: TrainingGoal, level: TrainingLevel) {
  if (goal === 'strength') {
    return level === 'advanced' ? '5세트 x 3-5회' : '4세트 x 4-6회';
  }

  if (goal === 'hypertrophy') {
    return level === 'beginner' ? '3세트 x 8-12회' : '4세트 x 8-12회';
  }

  return level === 'advanced' ? '4세트 x 8-15회' : '3세트 x 10-15회';
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [exerciseMachines, setExerciseMachines] = useState<ExerciseMachine[]>(mockMachines);
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>('CHEST');
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [workoutDate, setWorkoutDate] = useState(today);
  const [memo, setMemo] = useState('');
  const [note, setNote] = useState('');
  const [oneRmLift, setOneRmLift] = useState<OneRmLift>('squat');
  const [oneRmWeight, setOneRmWeight] = useState('');
  const [oneRmReps, setOneRmReps] = useState('');
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>('intermediate');
  const [trainingGoal, setTrainingGoal] = useState<TrainingGoal>('hypertrophy');
  const [splitType, setSplitType] = useState<SplitType>('upperLower');
  const [trainingDays, setTrainingDays] = useState(4);
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [priorityGroup, setPriorityGroup] = useState<MuscleGroup>('BACK');
  const [workoutStartedAt, setWorkoutStartedAt] = useState<number | null>(null);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeWorkoutRecords, setActiveWorkoutRecords] = useState<ActiveWorkoutRecord[]>([]);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false);
  const [customExerciseOpen, setCustomExerciseOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMovementPattern, setCustomMovementPattern] = useState('');
  const [customExerciseDescription, setCustomExerciseDescription] = useState('');
  const [customExerciseSaving, setCustomExerciseSaving] = useState(false);
  const [summarySessionId, setSummarySessionId] = useState<string | null>(null);
  const [selectedActivityDate, setSelectedActivityDate] = useState(today);
  const [recordVisualMode, setRecordVisualMode] = useState<RecordVisualMode>('market');
  const [marketSymbol, setMarketSymbol] = useState('NASDAQ:INTC');
  const [restDurationSeconds, setRestDurationSeconds] = useState(() => {
    const storedValue = Number(window.localStorage.getItem(restDurationKey));
    return storedValue >= minRestSeconds && storedValue <= maxRestSeconds
      ? storedValue
      : defaultRestSeconds;
  });
  const [sets, setSets] = useState<DraftSet[]>(() => [
    createDraftSet(),
    createDraftSet(),
    createDraftSet(),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser =
      window.localStorage.getItem(mockSessionKey) ?? window.localStorage.getItem(legacyMockSessionKey);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        window.localStorage.setItem(mockSessionKey, JSON.stringify(parsedUser));
        window.localStorage.removeItem(legacyMockSessionKey);
        setUser(parsedUser);
      } catch {
        window.localStorage.removeItem(mockSessionKey);
        window.localStorage.removeItem(legacyMockSessionKey);
      }
    }
    setAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let ignore = false;

    api.listExercises(user.id)
      .then((exercises) => {
        if (!ignore && exercises.length > 0) {
          setExerciseMachines(exercises);
        }
      })
      .catch(() => {
        if (!ignore) {
          setExerciseMachines(mockMachines);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let ignore = false;

    api.listWorkoutSessions(user.id)
      .then((loadedSessions) => {
        if (ignore) {
          return;
        }

        setSessions(loadedSessions);
        const inProgressSession = loadedSessions.find(
          (session) => session.status === 'IN_PROGRESS' && session.workoutDate === today,
        );

        if (inProgressSession) {
          setActiveSessionId(inProgressSession.id);
          setWorkoutStartedAt(inProgressSession.startedAt ? new Date(inProgressSession.startedAt).getTime() : Date.now());
          setWorkoutDate(inProgressSession.workoutDate);
          setActiveWorkoutRecords(toActiveWorkoutRecords(inProgressSession));
        }
      })
      .catch(() => {
        if (!ignore) {
          setSessions([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  const machines = useMemo(
    () => exerciseMachines.filter((machine) => machine.muscleGroup === selectedGroup),
    [exerciseMachines, selectedGroup],
  );

  useEffect(() => {
    setSelectedMachineId((current) => {
      if (current != null && machines.some((machine) => machine.id === current)) {
        return current;
      }
      return null;
      });
  }, [machines]);

  useEffect(() => {
    const hasRunningTimer = sets.some((set) => set.completed && set.remainingSeconds > 0);
    if (!hasRunningTimer) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSets((current) =>
        current.map((set) =>
          set.completed && set.remainingSeconds > 0
            ? { ...set, remainingSeconds: Math.max(0, set.remainingSeconds - 1) }
            : set,
        ),
      );
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sets]);

  useEffect(() => {
    if (workoutStartedAt == null) {
      return;
    }

    const tick = () => {
      setWorkoutElapsedSeconds(Math.floor((Date.now() - workoutStartedAt) / 1000));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [workoutStartedAt]);

  const selectedMachine = useMemo(
    () => machines.find((machine) => machine.id === selectedMachineId) ?? null,
    [machines, selectedMachineId],
  );

  const history: MachineHistory[] = useMemo(() => {
    if (selectedMachineId == null) {
      return [];
    }

    return sessions
      .flatMap((session) =>
        session.records
          .filter((record) => record.machineId === selectedMachineId)
          .map((record) => ({
            sessionId: session.id,
            recordId: record.id,
            workoutDate: session.workoutDate,
            machineName: record.machineName,
            sets: record.sets,
            note: record.note,
          })),
      )
      .slice(0, 10);
  }, [selectedMachineId, sessions]);

  const totalDraftSets = sets.filter((set) => set.weightKg && set.reps).length;
  const totalSavedSets = sessions.reduce(
    (sessionTotal, session) =>
      sessionTotal + session.records.reduce((recordTotal, record) => recordTotal + record.sets.length, 0),
    0,
  );
  const allHistoryItems: MachineHistory[] = sessions.flatMap((session) =>
    session.records.map((record) => ({
      sessionId: session.id,
      recordId: record.id,
      workoutDate: session.workoutDate,
      machineName: record.machineName,
      sets: record.sets,
      note: record.note,
    })),
  );
  const latestHistory = history[0];
  const oneRmWeightValue = Number(oneRmWeight);
  const oneRmRepsValue = Number(oneRmReps);
  const oneRmResult =
    Number.isFinite(oneRmWeightValue) && Number.isFinite(oneRmRepsValue) && oneRmWeightValue > 0 && oneRmRepsValue > 0
      ? oneRmWeightValue * (1 + oneRmRepsValue / 30)
      : null;
  const selectedOneRmExercise = oneRmExercises.find((exercise) => exercise.value === oneRmLift);
  const weeklyPlan: RoutineDay[] = useMemo(() => {
    const template = splitTemplates[splitType];
    const prescription = getPrescription(trainingGoal, trainingLevel);

    return Array.from({ length: trainingDays }, (_, index) => {
      const baseDay = template[index % template.length];
      const dayGroups = index === 0 && !baseDay.groups.includes(priorityGroup)
        ? [priorityGroup, ...baseDay.groups].slice(0, 4)
        : baseDay.groups;
      const catalog = dayGroups.flatMap((group) =>
        exerciseMachines.filter((machine) => machine.muscleGroup === group).slice(0, trainingLevel === 'advanced' ? 2 : 1),
      );
      const maxExercises = trainingLevel === 'beginner' ? 4 : trainingLevel === 'advanced' ? 6 : 5;

      return {
        dayLabel: weekLabels[index],
        title: baseDay.title,
        focus: dayGroups
          .map((group) => priorityGroupOptions.find((option) => option.value === group)?.label)
          .filter(Boolean)
          .join(' / '),
        groups: dayGroups,
        exercises: catalog.slice(0, maxExercises).map((machine) => machine.name),
        prescription,
      };
    });
  }, [exerciseMachines, priorityGroup, splitType, trainingDays, trainingGoal, trainingLevel]);
  const weeklyExerciseCount = weeklyPlan.reduce((total, day) => total + day.exercises.length, 0);
  const activeWorkoutParts = Array.from(new Set(activeWorkoutRecords.map((record) => record.muscleGroupLabel)));
  const activeWorkoutSetCount = activeWorkoutRecords.reduce((total, record) => total + record.setsCount, 0);
  const trainedDateSet = new Set(sessions.map((session) => session.workoutDate));
  const todaysSessions = sessions.filter((session) => session.workoutDate === today);
  const todaysWorkoutRecords: ActiveWorkoutRecord[] = todaysSessions.flatMap((session) =>
    session.records.map((record) => ({
      id: record.id,
      machineName: record.machineName,
      muscleGroupLabel: record.muscleGroupLabel,
      setsCount: record.sets.length,
      sets: record.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
      })),
      workoutDate: session.workoutDate,
    })),
  );
  const visibleWorkoutRecords = workoutStartedAt == null ? todaysWorkoutRecords : activeWorkoutRecords;
  const visibleWorkoutParts = Array.from(new Set(visibleWorkoutRecords.map((record) => record.muscleGroupLabel)));
  const visibleWorkoutSetCount = visibleWorkoutRecords.reduce((total, record) => total + record.setsCount, 0);
  const summarySession =
    sessions.find((session) => session.id === summarySessionId) ??
    sessions.find((session) => session.status === 'FINISHED' && session.workoutDate === today) ??
    null;
  const summaryStats = getSessionStats(summarySession);
  const selectedDateSessions = sessions.filter((session) => session.workoutDate === selectedActivityDate);
  const selectedDateStats = selectedDateSessions.reduce(
    (total, session) => {
      const stats = getSessionStats(session);
      return {
        exerciseCount: total.exerciseCount + stats.exerciseCount,
        setCount: total.setCount + stats.setCount,
        volume: total.volume + stats.volume,
      };
    },
    { exerciseCount: 0, setCount: 0, volume: 0 },
  );
  const todaysExerciseNames = Array.from(
    new Set(todaysSessions.flatMap((session) => session.records.map((record) => record.machineName))),
  );
  const todaysParts = Array.from(
    new Set(todaysSessions.flatMap((session) => session.records.map((record) => record.muscleGroupLabel))),
  );
  const calendarBaseDate = new Date();
  const calendarYear = calendarBaseDate.getFullYear();
  const calendarMonth = calendarBaseDate.getMonth();
  const calendarMonthLabel = `${calendarYear}년 ${calendarMonth + 1}월`;
  const calendarStartOffset = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarMonthLength = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarTrainedDateSet = new Set(
    sessions
      .filter((session) => {
        const sessionDate = new Date(`${session.workoutDate}T00:00:00`);
        return sessionDate.getFullYear() === calendarYear && sessionDate.getMonth() === calendarMonth;
      })
      .map((session) => session.workoutDate),
  );
  const calendarCells: Array<{ day: number; dateKey: string } | null> = [
    ...Array.from({ length: calendarStartOffset }, () => null),
    ...Array.from({ length: calendarMonthLength }, (_, index) => {
      const day = index + 1;
      return {
        day,
        dateKey: formatDateKey(new Date(calendarYear, calendarMonth, day)),
      };
    }),
  ];
  const workoutDateValue = new Date(`${workoutDate}T00:00:00`);
  const workoutDateLabel = `${workoutDateValue.getMonth() + 1}월 ${workoutDateValue.getDate()}일, 오후 운동`;

  if (!authChecked) {
    return <main className="loading">로그인 상태 확인 중</main>;
  }

  if (!user) {
    return <LoginGate onLoginSuccess={(nextUser) => {
      window.localStorage.setItem(mockSessionKey, JSON.stringify(nextUser));
      setUser(nextUser);
    }} />;
  }

  function addSet() {
    setSets((current) => [...current, createDraftSet()]);
  }

  function updateSet(setId: number, field: 'weightKg' | 'reps', value: string) {
    setSets((current) =>
      current.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
    );
  }

  function deleteSet(setId: number) {
    setSets((current) => (current.length === 1 ? current : current.filter((set) => set.id !== setId)));
  }

  function toggleSetComplete(setId: number) {
    setSets((current) =>
      current.map((set) => {
        if (set.id !== setId) {
          return set;
        }

        const nextCompleted = !set.completed;
        return {
          ...set,
          completed: nextCompleted,
          remainingSeconds: nextCompleted ? restDurationSeconds : 0,
        };
      }),
    );
  }

  function updateRestDuration(nextValue: number) {
    const normalizedValue = Math.min(maxRestSeconds, Math.max(minRestSeconds, nextValue));
    setRestDurationSeconds(normalizedValue);
    window.localStorage.setItem(restDurationKey, String(normalizedValue));
  }

  function resetDraft() {
    setMemo('');
    setNote('');
    setSets([createDraftSet(), createDraftSet(), createDraftSet()]);
  }

  function toActiveWorkoutRecords(session: WorkoutSession): ActiveWorkoutRecord[] {
    return session.records.map((record) => ({
      id: record.id,
      machineName: record.machineName,
      muscleGroupLabel: record.muscleGroupLabel,
      setsCount: record.sets.length,
      sets: record.sets.map((set) => ({
        weightKg: set.weightKg,
        reps: set.reps,
      })),
      workoutDate: session.workoutDate,
    }));
  }

  function upsertSession(nextSession: WorkoutSession) {
    setSessions((current) => {
      const exists = current.some((session) => session.id === nextSession.id);
      if (exists) {
        return current.map((session) => (session.id === nextSession.id ? nextSession : session));
      }

      return [nextSession, ...current];
    });
  }

  function createLocalWorkoutSession(): WorkoutSession {
    const now = new Date().toISOString();
    return {
      id: `local-${Date.now()}`,
      userId: user?.id,
      workoutDate: today,
      status: 'IN_PROGRESS',
      startedAt: now,
      memo: null,
      records: [],
    };
  }

  function isLocalSession(sessionId: string) {
    return sessionId.startsWith('local-');
  }

  async function ensureWorkoutSessionStarted() {
    if (activeSessionId && !isLocalSession(activeSessionId)) {
      return activeSessionId;
    }

    if (user) {
      try {
        const startedSession = await api.startWorkoutSession(user.id, { workoutDate: today, memo });
        setSessions((current) => [
          startedSession,
          ...current.filter((session) => session.id !== startedSession.id && session.id !== activeSessionId),
        ]);
        setActiveSessionId(startedSession.id);
        setWorkoutStartedAt(startedSession.startedAt ? new Date(startedSession.startedAt).getTime() : Date.now());
        setWorkoutElapsedSeconds(0);
        setActiveWorkoutRecords(toActiveWorkoutRecords(startedSession));
        setWorkoutDate(startedSession.workoutDate);
        return startedSession.id;
      } catch {
        // Keep the workout usable when the backend is not running locally.
      }
    }

    const localSession = createLocalWorkoutSession();
    upsertSession(localSession);
    setActiveSessionId(localSession.id);
    setWorkoutStartedAt(localSession.startedAt ? new Date(localSession.startedAt).getTime() : Date.now());
    setWorkoutElapsedSeconds(0);
    setActiveWorkoutRecords([]);
    setWorkoutDate(today);
    return localSession.id;
  }

  async function startWorkout() {
    await ensureWorkoutSessionStarted();
    setExercisePickerOpen(false);
    setExerciseFormOpen(false);
    setActiveView('record');
  }

  async function finishWorkout() {
    let nextSummarySessionId = activeSessionId;

    if (user && activeSessionId && !isLocalSession(activeSessionId)) {
      try {
        const finishedSession = await api.finishWorkoutSession(user.id, activeSessionId);
        upsertSession(finishedSession);
        nextSummarySessionId = finishedSession.id;
      } catch (error) {
        setError(error instanceof Error ? error.message : '운동 종료에 실패했습니다.');
        return;
      }
    } else if (activeSessionId) {
      const currentSession = sessions.find((session) => session.id === activeSessionId);
      const finishedAt = new Date().toISOString();
      const nextDurationSeconds = Math.max(1, workoutElapsedSeconds);
      const finishedSession = currentSession
        ? {
            ...currentSession,
            status: 'FINISHED' as const,
            finishedAt,
            durationSeconds: nextDurationSeconds,
          }
        : null;

      setSessions((current) =>
        current.map((session) =>
          session.id === activeSessionId
            ? finishedSession ?? session
            : session,
        ),
      );
      nextSummarySessionId = finishedSession?.id ?? activeSessionId;
    }

    setSummarySessionId(nextSummarySessionId);
    setWorkoutStartedAt(null);
    setActiveSessionId(null);
    setExercisePickerOpen(false);
    setExerciseFormOpen(false);
    setCustomExerciseOpen(false);
    setActiveView('summary');
  }

  async function openExercisePicker() {
    if (workoutStartedAt == null) {
      await ensureWorkoutSessionStarted();
    }

    setSelectedMachineId(null);
    setExerciseFormOpen(false);
    setExercisePickerOpen(true);
    setActiveView('record');
  }

  function resetCustomExerciseForm() {
    setCustomExerciseName('');
    setCustomMovementPattern('');
    setCustomExerciseDescription('');
  }

  async function submitCustomExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !customExerciseName.trim()) {
      return;
    }

    setCustomExerciseSaving(true);
    setError(null);

    try {
      const createdExercise = await api.createCustomExercise(user.id, {
        name: customExerciseName,
        muscleGroup: selectedGroup,
        movementPattern: customMovementPattern,
        description: customExerciseDescription,
      });
      setExerciseMachines((current) => [...current, createdExercise]);
      setSelectedMachineId(createdExercise.id);
      setExerciseFormOpen(true);
      setCustomExerciseOpen(false);
      resetCustomExerciseForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : '커스텀 운동 등록에 실패했습니다.');
    } finally {
      setCustomExerciseSaving(false);
    }
  }

  async function deleteCustomExercise(machine: ExerciseMachine) {
    if (!user || !machine.deletable) {
      return;
    }

    setError(null);

    try {
      await api.deleteCustomExercise(user.id, machine.id);
      setExerciseMachines((current) => current.filter((exercise) => exercise.id !== machine.id));
      if (selectedMachineId === machine.id) {
        setSelectedMachineId(null);
        setExerciseFormOpen(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '커스텀 운동 삭제에 실패했습니다.');
    }
  }

  function logout() {
    window.localStorage.removeItem(mockSessionKey);
    window.localStorage.removeItem(legacyMockSessionKey);
    setWorkoutStartedAt(null);
    setWorkoutElapsedSeconds(0);
    setActiveSessionId(null);
    setActiveWorkoutRecords([]);
    setExercisePickerOpen(false);
    setExerciseFormOpen(false);
    setCustomExerciseOpen(false);
    setSummarySessionId(null);
    setSessions([]);
    setUser(null);
    setActiveView('home');
  }

  async function submitWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMachineId) {
      return;
    }

    const validSets = sets
      .map((set, index) => ({
        setOrder: index + 1,
        weightKg: Number(set.weightKg),
        reps: Number(set.reps),
        completed: set.completed,
      }))
      .filter((set) => Number.isFinite(set.weightKg) && set.weightKg >= 0 && set.reps > 0);

    if (validSets.length === 0) {
      setError('최소 1개 이상의 세트를 입력하세요.');
      return;
    }

    setSaving(true);
    setError(null);

    const sessionId = await ensureWorkoutSessionStarted();

    try {
      if (user && sessionId && !isLocalSession(sessionId)) {
        const updatedSession = await api.addWorkoutRecord(user.id, sessionId, {
          catalogId: selectedMachineId,
          note,
          sets: validSets,
        });

        upsertSession(updatedSession);
        setActiveWorkoutRecords(toActiveWorkoutRecords(updatedSession));
      } else if (sessionId) {
        const localRecord = {
          id: `local-record-${Date.now()}`,
          recordId: `local-record-${Date.now()}`,
          machineId: selectedMachineId,
          machineName: selectedMachine?.name ?? '선택 기구',
          catalogId: selectedMachineId,
          exerciseName: selectedMachine?.name ?? '선택 기구',
          muscleGroup: selectedMachine?.muscleGroup,
          muscleGroupLabel: selectedMachine?.muscleGroupLabel ?? '',
          movementPattern: selectedMachine?.movementPattern,
          note,
          sets: validSets.map((set) => ({
            setOrder: set.setOrder,
            weightKg: String(set.weightKg),
            reps: set.reps,
            completed: set.completed,
          })),
          createdAt: new Date().toISOString(),
        };
        let nextSession: WorkoutSession | null = null;

        setSessions((current) =>
          current.map((session) => {
            if (session.id !== sessionId) {
              return session;
            }

            nextSession = {
              ...session,
              memo,
              records: [...session.records, localRecord],
            };
            return nextSession;
          }),
        );

        const activeRecord: ActiveWorkoutRecord = {
          id: localRecord.id,
          machineName: localRecord.machineName,
          muscleGroupLabel: localRecord.muscleGroupLabel,
          setsCount: localRecord.sets.length,
          sets: localRecord.sets.map((set) => ({
            weightKg: set.weightKg,
            reps: set.reps,
          })),
          workoutDate,
        };
        setActiveWorkoutRecords((current) => [activeRecord, ...current]);
      }

      resetDraft();
      setExercisePickerOpen(false);
      setExerciseFormOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : '운동 기록 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-wordmark brand-home-button" type="button" onClick={() => setActiveView('home')}>
          Repick
        </button>
        <nav className="main-nav" aria-label="주요 메뉴">
          <button className={activeView === 'home' ? 'active' : ''} type="button" onClick={() => setActiveView('home')}>
            홈
          </button>
          <button className={activeView === 'planner' ? 'active' : ''} type="button" onClick={() => setActiveView('planner')}>
            루틴설계
          </button>
          <button className={activeView === 'record' ? 'active' : ''} type="button" onClick={() => setActiveView('record')}>
            운동기록
          </button>
          <button className={activeView === 'history' ? 'active' : ''} type="button" onClick={() => setActiveView('history')}>
            히스토리
          </button>
          <button className={activeView === 'oneRm' ? 'active' : ''} type="button" onClick={() => setActiveView('oneRm')}>
            1RM
          </button>
          <button className={activeView === 'activity' ? 'active' : ''} type="button" onClick={() => setActiveView('activity')}>
            내 활동
          </button>
        </nav>
        <div className="user-chip">
          <UserRound size={18} />
          <span>{user.displayName}</span>
          <button aria-label="로그아웃" type="button" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <section className="hero-band" id="home">
        <div className="hero-glow" />
        <div className="hero-content">
          <span>{workoutStartedAt == null ? '오늘의 운동 기록' : `운동 중 ${formatSeconds(workoutElapsedSeconds)}`}</span>
          <h1>
            방금 한 세트까지
            <br />
            기구별로 남겨볼까요?
          </h1>
          <button type="button" onClick={workoutStartedAt == null ? startWorkout : () => setActiveView('record')}>
            {workoutStartedAt == null ? '운동 시작' : '운동 이어가기'}
          </button>
        </div>
      </section>

      <section className="content-shell">
        {activeView === 'home' && (
          <section className="home-dashboard">
            <div className="section-heading">
              <div>
                <h2>오늘의 Repick</h2>
                <p>기록, 휴식 타이머, 이전 수행 기록을 한 흐름으로 관리합니다.</p>
              </div>
              <button className="link-button" type="button" onClick={workoutStartedAt == null ? startWorkout : () => setActiveView('record')}>
                {workoutStartedAt == null ? '운동 시작하기' : '운동 이어가기'}
                <ChevronRight size={16} />
              </button>
            </div>

            <section className={workoutStartedAt == null ? 'workout-status-card' : 'workout-status-card active'}>
              <div className="workout-status-main">
                <span>{workoutStartedAt == null ? 'Ready' : 'Live workout'}</span>
                <strong>{workoutStartedAt == null ? '오늘 운동을 시작해볼까요?' : formatSeconds(workoutElapsedSeconds)}</strong>
                <p>
                  {workoutStartedAt == null
                    ? '시작 버튼을 누르면 운동 시간이 기록되고, 저장한 종목과 부위가 세션 요약에 쌓입니다.'
                    : `${activeWorkoutRecords.length}개 운동, ${activeWorkoutSetCount}세트 진행 중`}
                </p>
              </div>
              <div className="workout-status-actions">
                {workoutStartedAt == null ? (
                  <button className="primary-button" type="button" onClick={startWorkout}>
                    <Timer size={16} />
                    운동 시작
                  </button>
                ) : (
                  <>
                    <button className="secondary-button" type="button" onClick={openExercisePicker}>
                      <Plus size={16} />
                      기록 추가
                    </button>
                    <button className="primary-button" type="button" onClick={finishWorkout}>
                      <CheckCircle2 size={16} />
                      운동 종료
                    </button>
                  </>
                )}
              </div>
              <div className="workout-chip-row">
                {(workoutStartedAt == null ? todaysParts : activeWorkoutParts).length === 0 && (
                  <span>아직 기록된 부위가 없습니다</span>
                )}
                {(workoutStartedAt == null ? todaysParts : activeWorkoutParts).map((part) => (
                  <span key={part}>{part}</span>
                ))}
              </div>
            </section>

            <div className="home-metrics">
              <article>
                <Dumbbell size={22} />
                <strong>{todaysExerciseNames.length}</strong>
                <span>오늘 운동 종목</span>
              </article>
              <article>
                <CalendarDays size={22} />
                <strong>{trainedDateSet.size}</strong>
                <span>운동한 날짜</span>
              </article>
              <article>
                <CheckCircle2 size={22} />
                <strong>{totalSavedSets}</strong>
                <span>누적 세트</span>
              </article>
            </div>

            <div className="home-actions-grid">
              <button type="button" onClick={openExercisePicker}>
                <strong>새 운동 기록</strong>
                <span>기구를 고르고 세트별 무게/횟수를 입력합니다.</span>
              </button>
              <button type="button" onClick={() => setActiveView('planner')}>
                <strong>AI 루틴 설계</strong>
                <span>프로필과 분할 방식을 고르면 주간 플랜 초안을 만듭니다.</span>
              </button>
              <button type="button" onClick={() => setActiveView('history')}>
                <strong>히스토리 보기</strong>
                <span>최근 저장한 기록과 기구별 수행 내역을 확인합니다.</span>
              </button>
              <button type="button" onClick={() => setActiveView('oneRm')}>
                <strong>1RM 계산기</strong>
                <span>주요 리프트의 예상 최대 중량을 빠르게 계산합니다.</span>
              </button>
              <button type="button" onClick={() => setActiveView('activity')}>
                <strong>내 활동 보기</strong>
                <span>저장된 세션을 카드 형태로 훑어봅니다.</span>
              </button>
            </div>
          </section>
        )}

        {activeView === 'planner' && (
          <section className="planner-page">
            <div className="section-heading">
              <div>
                <h2>AI 루틴 설계</h2>
                <p>프로필, 목표, 분할 방식을 고르면 Repick 운동 카탈로그 기반 주간 플랜 초안을 만듭니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => setActiveView('record')}>
                이 루틴으로 기록하기
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="planner-layout">
              <section className="planner-config-card">
                <div className="planner-card-title">
                  <span>01</span>
                  <div>
                    <h3>프로필</h3>
                    <p>현재 운동 숙련도와 우선 목표를 선택하세요.</p>
                  </div>
                </div>

                <div className="option-card-grid">
                  {trainingLevelOptions.map((option) => (
                    <button
                      className={trainingLevel === option.value ? 'option-card selected' : 'option-card'}
                      key={option.value}
                      type="button"
                      onClick={() => setTrainingLevel(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>

                <div className="planner-control-grid">
                  <label>
                    <span>목표</span>
                    <select value={trainingGoal} onChange={(event) => setTrainingGoal(event.target.value as TrainingGoal)}>
                      {trainingGoalOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>우선 부위</span>
                    <select value={priorityGroup} onChange={(event) => setPriorityGroup(event.target.value as MuscleGroup)}>
                      {priorityGroupOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="planner-card-title">
                  <span>02</span>
                  <div>
                    <h3>분할 방식</h3>
                    <p>주간 빈도와 운동 시간을 기준으로 플랜 밀도를 조절합니다.</p>
                  </div>
                </div>

                <div className="split-option-grid">
                  {splitOptions.map((option) => (
                    <button
                      className={splitType === option.value ? 'split-option selected' : 'split-option'}
                      key={option.value}
                      type="button"
                      onClick={() => setSplitType(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </button>
                  ))}
                </div>

                <div className="planner-range-grid">
                  <label>
                    <span>주 {trainingDays}회</span>
                    <input
                      max="6"
                      min="2"
                      type="range"
                      value={trainingDays}
                      onChange={(event) => setTrainingDays(Number(event.target.value))}
                    />
                  </label>
                  <label>
                    <span>회당 {sessionMinutes}분</span>
                    <input
                      max="90"
                      min="30"
                      step="15"
                      type="range"
                      value={sessionMinutes}
                      onChange={(event) => setSessionMinutes(Number(event.target.value))}
                    />
                  </label>
                </div>
              </section>

              <aside className="planner-result-panel">
                <div className="planner-summary">
                  <span>Repick Plan Draft</span>
                  <strong>{trainingDays}일 루틴</strong>
                  <p>
                    {sessionMinutes}분 세션 기준, 총 {weeklyExerciseCount}개 운동으로 구성했습니다.
                  </p>
                </div>

                <div className="weekly-plan-list">
                  {weeklyPlan.map((day) => (
                    <article className="weekly-plan-card" key={`${day.dayLabel}-${day.title}`}>
                      <div className="weekly-plan-head">
                        <span>{day.dayLabel}</span>
                        <div>
                          <strong>{day.title}</strong>
                          <small>{day.focus}</small>
                        </div>
                      </div>
                      <ul>
                        {day.exercises.map((exercise) => (
                          <li key={exercise}>{exercise}</li>
                        ))}
                      </ul>
                      <p>{day.prescription}</p>
                    </article>
                  ))}
                </div>
              </aside>
            </div>
          </section>
        )}

        {activeView === 'record' && (
          <section className="record-session-page">
            <div className="record-session-head">
              <div>
                <span>{workoutStartedAt == null ? '오늘 운동' : `진행 중 ${formatSeconds(workoutElapsedSeconds)}`}</span>
                <h2>{workoutDateLabel}</h2>
                <p>
                  {visibleWorkoutRecords.length === 0
                    ? '운동을 시작하고 오늘 기록할 종목을 추가하세요.'
                    : `${visibleWorkoutRecords.length}개 운동, ${visibleWorkoutSetCount}세트가 오늘 기록에 올라와 있습니다.`}
                </p>
              </div>
              <div className="record-session-head-actions">
                <button
                  className={workoutStartedAt == null ? 'session-timer-button' : 'session-timer-button running'}
                  type="button"
                  onClick={workoutStartedAt == null ? startWorkout : finishWorkout}
                >
                  {workoutStartedAt == null ? <Timer size={18} /> : <CheckCircle2 size={18} />}
                  <span>{workoutStartedAt == null ? '운동 시작' : formatSeconds(workoutElapsedSeconds)}</span>
                  <small>{workoutStartedAt == null ? '타이머 시작' : '누르면 종료'}</small>
                </button>
                <button className="icon-button" type="button" aria-label="운동 옵션">
                  <span />
                  <span />
                  <span />
                </button>
              </div>
            </div>

            <section className={workoutStartedAt == null ? 'workout-log-stage' : 'workout-log-stage active'}>
              <div className="chart-control-dock">
                <div className="visual-mode-tabs" aria-label="운동 카드 보기 방식">
                  <button
                    className={recordVisualMode === 'body' ? 'active' : ''}
                    type="button"
                    onClick={() => setRecordVisualMode('body')}
                  >
                    운동
                  </button>
                  <button
                    className={recordVisualMode === 'market' ? 'active' : ''}
                    type="button"
                    onClick={() => setRecordVisualMode('market')}
                  >
                    차트
                  </button>
                </div>
                <select value={marketSymbol} onChange={(event) => setMarketSymbol(event.target.value)}>
                  {marketSymbolOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={recordVisualMode === 'market' ? 'muscle-visual-card market-mode' : 'muscle-visual-card'}
                aria-label={recordVisualMode === 'market' ? '운동 중 주식 차트' : '오늘 운동 부위 비주얼'}
              >
                {recordVisualMode === 'market' && <TradingViewChart symbol={marketSymbol} />}
              </div>

              <div className="workout-log-list">
                {visibleWorkoutRecords.length === 0 && (
                  <article className="workout-log-empty">
                    <Dumbbell size={24} />
                    <strong>아직 추가된 운동이 없습니다</strong>
                    <p>운동 추가를 누르면 부위별 운동 목록과 세트 입력 화면이 열립니다.</p>
                  </article>
                )}
                {visibleWorkoutRecords.map((record) => (
                  <article className="workout-log-item" key={`${record.id}-${record.workoutDate}`}>
                    <span className="workout-log-thumb">
                      <Dumbbell size={24} />
                    </span>
                    <div>
                      <strong>{record.machineName}</strong>
                      <p>{record.muscleGroupLabel} · {record.setsCount}세트</p>
                      <small>{formatWorkoutSetSummary(record.sets)}</small>
                    </div>
                    <button className="icon-button" type="button" aria-label={`${record.machineName} 옵션`}>
                      <span />
                      <span />
                      <span />
                    </button>
                  </article>
                ))}
              </div>

              <div className="workout-record-actions">
                {workoutStartedAt == null ? (
                  <button className="start-workout-button" type="button" onClick={startWorkout}>
                    <Timer size={20} />
                    시작
                  </button>
                ) : (
                  <button className="start-workout-button" type="button" onClick={finishWorkout}>
                    <CheckCircle2 size={20} />
                    종료
                  </button>
                )}
                <button className="add-workout-button" type="button" onClick={openExercisePicker}>
                  <Plus size={24} />
                  운동 추가
                </button>
              </div>
            </section>

            {exercisePickerOpen && (
              <div className="exercise-picker-backdrop" role="presentation">
              <section className="exercise-picker-panel" role="dialog" aria-modal="true" aria-label="운동 추가">
                <div className="section-heading compact">
                  <div>
                    <h2>{exerciseFormOpen ? selectedMachine?.name ?? '세트 설정' : `${machines.length}개의 운동 기구`}</h2>
                    <p>
                      {exerciseFormOpen
                        ? '세트별 무게와 횟수를 입력하고 완료를 누르면 휴식 타이머가 시작됩니다.'
                        : '부위를 고르고 오늘 수행한 운동을 선택하세요.'}
                    </p>
                  </div>
                  <button
                    className="link-button"
                    type="button"
                    onClick={() => {
                      setExercisePickerOpen(false);
                      setExerciseFormOpen(false);
                    }}
                  >
                    닫기
                    <ChevronRight size={16} />
                  </button>
                </div>

                {!exerciseFormOpen && (
                  <>
                    <div className="segment-control">
                      {muscleGroups.map((group) => (
                        <button
                          className={selectedGroup === group.value ? 'active' : ''}
                          key={group.value}
                          type="button"
                          onClick={() => {
                            setSelectedGroup(group.value);
                            setSelectedMachineId(null);
                            setExerciseFormOpen(false);
                          }}
                        >
                          {group.label}
                        </button>
                      ))}
                    </div>

                    <div className="custom-exercise-bar">
                      <div>
                        <strong>내 기구 등록</strong>
                        <span>브랜드명이나 헬스장 전용 명칭까지 그대로 저장하세요.</span>
                      </div>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setCustomExerciseOpen((current) => !current)}
                      >
                        <Plus size={16} />
                        커스텀 추가
                      </button>
                    </div>

                    {customExerciseOpen && (
                      <form className="custom-exercise-form" onSubmit={submitCustomExercise}>
                        <label>
                          <span>운동/기구명</span>
                          <input
                            value={customExerciseName}
                            onChange={(event) => setCustomExerciseName(event.target.value)}
                            placeholder="예: 해머스트렝스 인클라인 프레스"
                          />
                        </label>
                        <label>
                          <span>패턴</span>
                          <input
                            value={customMovementPattern}
                            onChange={(event) => setCustomMovementPattern(event.target.value)}
                            placeholder="예: Machine Push"
                          />
                        </label>
                        <label className="custom-description-field">
                          <span>설명</span>
                          <input
                            value={customExerciseDescription}
                            onChange={(event) => setCustomExerciseDescription(event.target.value)}
                            placeholder="예: 우리 헬스장 오른쪽 라인 두 번째 기구"
                          />
                        </label>
                        <button className="primary-button" type="submit" disabled={customExerciseSaving}>
                          <Save size={16} />
                          {customExerciseSaving ? '등록 중' : '등록'}
                        </button>
                      </form>
                    )}

                    {error && <p className="error-message">{error}</p>}

                    <div className="machine-card-grid compact">
                      {machines.map((machine) => (
                        <article
                          className={selectedMachineId === machine.id ? 'machine-card selected' : 'machine-card'}
                          key={machine.id}
                        >
                          <button
                            className="machine-card-select"
                            type="button"
                            onClick={() => {
                              setSelectedMachineId(machine.id);
                              setExerciseFormOpen(true);
                            }}
                          >
                            <div className="machine-card-top">
                              <span className="machine-avatar">
                                <Dumbbell size={18} />
                              </span>
                              <span className="status-dot" />
                            </div>
                            <strong>{machine.name}</strong>
                            <p>{machine.description}</p>
                            <div className="machine-tags">
                              <span>#{machine.muscleGroupLabel}</span>
                              <span>#{machine.movementPattern}</span>
                              {machine.custom && <span>#내기구</span>}
                            </div>
                          </button>
                          {machine.deletable && (
                            <button
                              className="machine-delete-button"
                              type="button"
                              aria-label={`${machine.name} 삭제`}
                              onClick={() => deleteCustomExercise(machine)}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </article>
                      ))}
                    </div>
                  </>
                )}

                {exerciseFormOpen && (
                <section className="record-layout exercise-detail-layout">
                  <form className="record-form" onSubmit={submitWorkout}>
                    <div className="form-title">
                      <div>
                        <span className="eyebrow">{selectedMachine?.muscleGroupLabel ?? '기구 선택'}</span>
                        <h2>{selectedMachine?.name ?? '오늘 운동한 기구를 선택하세요'}</h2>
                        <p>{selectedMachine?.description ?? '기구를 선택하면 기록 입력과 이전 기록이 연결됩니다.'}</p>
                      </div>
                      <div className="mini-metric">
                        <Activity size={18} />
                        <strong>{totalDraftSets}</strong>
                        <span>입력 세트</span>
                      </div>
                    </div>

                    <div className="sets-header">
                      <div>
                        <h3>세트 기록</h3>
                        <p>완료를 누르면 설정한 휴식 타이머가 시작됩니다.</p>
                      </div>
                      <div className="set-tools">
                        <div className="rest-stepper" aria-label="세트간 휴식 시간 설정">
                          <button
                            aria-label="휴식 시간 10초 줄이기"
                            type="button"
                            onClick={() => updateRestDuration(restDurationSeconds - 10)}
                            disabled={restDurationSeconds <= minRestSeconds}
                          >
                            <Minus size={15} />
                          </button>
                          <span>
                            <Timer size={15} />
                            {formatSeconds(restDurationSeconds)}
                          </span>
                          <button
                            aria-label="휴식 시간 10초 늘리기"
                            type="button"
                            onClick={() => updateRestDuration(restDurationSeconds + 10)}
                            disabled={restDurationSeconds >= maxRestSeconds}
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                        <button type="button" onClick={addSet}>
                          <Plus size={16} />
                          세트 추가
                        </button>
                      </div>
                    </div>

                    <div className="set-grid">
                      {sets.map((set, index) => (
                        <div className={set.completed ? 'set-row completed' : 'set-row'} key={set.id}>
                          <span className="set-number">{index + 1}</span>
                          <input
                            inputMode="decimal"
                            placeholder="무게 kg"
                            value={set.weightKg}
                            onChange={(event) => updateSet(set.id, 'weightKg', event.target.value)}
                          />
                          <input
                            inputMode="numeric"
                            placeholder="횟수"
                            value={set.reps}
                            onChange={(event) => updateSet(set.id, 'reps', event.target.value)}
                          />
                          <button
                            className="complete-set-button"
                            type="button"
                            aria-label={`${index + 1}세트 완료`}
                            onClick={() => toggleSetComplete(set.id)}
                          >
                            <CheckCircle2 size={16} />
                            <span>{set.completed ? '완료됨' : '완료'}</span>
                          </button>
                          <strong className={set.remainingSeconds > 0 ? 'rest-timer active' : 'rest-timer'}>
                            <Timer size={16} />
                            {set.completed
                              ? set.remainingSeconds > 0
                                ? formatSeconds(set.remainingSeconds)
                                : '휴식 끝'
                              : formatSeconds(restDurationSeconds)}
                          </strong>
                          <button
                            aria-label={`${index + 1}세트 삭제`}
                            className="delete-set-button"
                            type="button"
                            onClick={() => deleteSet(set.id)}
                            disabled={sets.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <label className="note-field">
                      <span>기구별 메모</span>
                      <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="자세, 느낌, 다음 목표" />
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    <div className="form-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => {
                          setSelectedMachineId(null);
                          setExerciseFormOpen(false);
                        }}
                      >
                        운동 다시 선택
                      </button>
                      <button className="secondary-button" type="button" onClick={resetDraft}>
                        <RotateCcw size={16} />
                        초기화
                      </button>
                      <button className="primary-button" type="submit" disabled={saving || selectedMachineId == null}>
                        <Save size={16} />
                        {saving ? '저장 중' : '기록 저장'}
                      </button>
                    </div>
                  </form>

                  <aside className="insight-panel">
                    <div className="insight-card">
                      <div className="panel-title">
                        <Trophy size={18} />
                        <h3>선택 기구 요약</h3>
                      </div>
                      <strong>{selectedMachine?.name ?? '기구 미선택'}</strong>
                      <p>
                        {latestHistory
                          ? `${latestHistory.workoutDate}에 ${latestHistory.sets.length}세트 수행`
                          : '아직 이 기구의 이전 기록이 없습니다.'}
                      </p>
                    </div>

                    <div className="insight-card insight-chart-card">
                      <div className="panel-title">
                        <Activity size={18} />
                        <h3>운동 중 차트</h3>
                      </div>
                      <div className="compact-market-chart">
                        <TradingViewChart symbol={marketSymbol} />
                      </div>
                    </div>

                    <div className="panel-title history-title">
                      <History size={18} />
                      <h3>이전 기록</h3>
                    </div>
                    <div className="history-list" id="history">
                      {history.length === 0 && <p className="empty">아직 이 기구의 기록이 없습니다.</p>}
                      {history.map((item) => (
                        <article className="history-card" key={item.recordId}>
                          <div>
                            <strong>{item.workoutDate}</strong>
                            <span>{item.sets.length}세트</span>
                          </div>
                          <p>{item.sets.map((set) => `${set.weightKg}kg x ${set.reps}`).join(' / ')}</p>
                        </article>
                      ))}
                    </div>
                  </aside>
                </section>
                )}
              </section>
              </div>
            )}
          </section>
        )}

        {activeView === 'history' && (
          <section className="history-page">
            <div className="section-heading">
              <div>
                <h2>전체 운동 히스토리</h2>
                <p>저장한 세션과 세트 기록을 최신순으로 확인합니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => setActiveView('record')}>
                새 기록
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="history-page-list">
              {allHistoryItems.length === 0 && <p className="empty">아직 저장된 기록이 없습니다.</p>}
              {allHistoryItems.map((item) => (
                <article className="history-card" key={item.recordId}>
                  <div>
                    <strong>{item.machineName}</strong>
                    <span>{item.workoutDate}</span>
                  </div>
                  <p>{item.sets.map((set) => `${set.weightKg}kg x ${set.reps}`).join(' / ')}</p>
                  {item.note && <small>{item.note}</small>}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === 'oneRm' && (
          <section className="one-rm-page">
            <div className="section-heading">
              <div>
                <h2>1RM 계산기</h2>
                <p>Epley Formula로 스쿼트, 벤치프레스, 데드리프트, 오버헤드프레스의 예상 1RM을 계산합니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => setActiveView('record')}>
                운동 기록하기
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="one-rm-layout">
              <form className="one-rm-card" onSubmit={(event) => event.preventDefault()}>
                <div className="panel-title">
                  <Calculator size={18} />
                  <h3>측정값 입력</h3>
                </div>

                <label>
                  <span>종목</span>
                  <select value={oneRmLift} onChange={(event) => setOneRmLift(event.target.value as OneRmLift)}>
                    {oneRmExercises.map((exercise) => (
                      <option key={exercise.value} value={exercise.value}>
                        {exercise.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="one-rm-input-grid">
                  <label>
                    <span>중량 (kg)</span>
                    <input
                      inputMode="decimal"
                      min="0"
                      placeholder="예: 100"
                      type="number"
                      value={oneRmWeight}
                      onChange={(event) => setOneRmWeight(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>횟수</span>
                    <input
                      inputMode="numeric"
                      min="1"
                      placeholder="예: 5"
                      type="number"
                      value={oneRmReps}
                      onChange={(event) => setOneRmReps(event.target.value)}
                    />
                  </label>
                </div>
              </form>

              <aside className="one-rm-result-card">
                <span className="formula-chip">Epley Formula</span>
                <div>
                  <small>{selectedOneRmExercise?.label ?? '선택 종목'} 예상 1RM</small>
                  <strong>{oneRmResult == null ? '-' : `${oneRmResult.toFixed(1)} kg`}</strong>
                </div>
                <p className="formula-line">1RM = W x (1 + R / 30)</p>
                <p>
                  {oneRmResult == null
                    ? '종목, 중량, 횟수를 입력하면 예상 최대 중량이 표시됩니다.'
                    : `${oneRmWeightValue}kg x ${oneRmRepsValue}회 기준으로 계산했습니다.`}
                </p>
              </aside>
            </div>
          </section>
        )}

        {activeView === 'summary' && summarySession && (
          <section className="workout-summary-page">
            <div className="section-heading">
              <div>
                <h2>운동 요약</h2>
                <p>{formatWorkoutDateLabel(summarySession.workoutDate)} 기록을 한 페이지로 정리했습니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => setActiveView('activity')}>
                내 활동에서 보기
                <ChevronRight size={16} />
              </button>
            </div>

            <section className="summary-hero-card">
              <div>
                <span>{summarySession.status === 'FINISHED' ? 'Workout Complete' : 'Workout Draft'}</span>
                <strong>{summaryStats.exerciseCount}개 운동 · {summaryStats.setCount}세트</strong>
                <p>
                  {summarySession.durationSeconds
                    ? `${formatDuration(summarySession.durationSeconds)} 동안 기록했습니다.`
                    : '운동 시간이 아직 종료 기록에 반영되지 않았습니다.'}
                </p>
              </div>
              <div className="summary-volume">
                <small>총 볼륨</small>
                <strong>{Math.round(summaryStats.volume).toLocaleString()} kg</strong>
              </div>
            </section>

            <div className="summary-part-row">
              {summaryStats.parts.length === 0 && <span>기록된 부위 없음</span>}
              {summaryStats.parts.map((part) => (
                <span key={part}>{part}</span>
              ))}
            </div>

            <div className="summary-record-list">
              {summarySession.records.map((record) => (
                <article className="summary-record-card" key={record.id}>
                  <div>
                    <strong>{record.machineName}</strong>
                    <span>{record.muscleGroupLabel} · {record.sets.length}세트</span>
                  </div>
                  <p>{record.sets.map((set) => `${set.weightKg}kg x ${set.reps}`).join(' / ')}</p>
                  {record.note && <small>{record.note}</small>}
                </article>
              ))}
            </div>
          </section>
        )}

        {activeView === 'activity' && (
        <section className="session-section">
          <div className="section-heading">
            <div>
              <h2>최근 운동 세션들</h2>
              <p>저장한 기록이 여기에 쌓입니다.</p>
            </div>
            <button className="link-button" type="button">
              더보기
              <ChevronRight size={16} />
            </button>
          </div>

          <section className="activity-overview-grid">
            <article className="activity-summary-card">
              <span>이번 달 운동일</span>
              <strong>{calendarTrainedDateSet.size}일</strong>
              <p>
                {todaysExerciseNames.length > 0
                  ? `오늘은 ${todaysExerciseNames.join(', ')}를 기록했습니다.`
                  : '오늘 운동을 시작하면 캘린더에 바로 표시됩니다.'}
              </p>
            </article>

            <article className="calendar-card">
              <div className="calendar-card-head">
                <strong>{calendarMonthLabel}</strong>
                <span>운동한 날 표시</span>
              </div>
              <div className="calendar-weekdays">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {calendarCells.map((cell, index) => (
                  <button
                    type="button"
                    className={
                      cell == null
                        ? 'calendar-day empty-day'
                        : calendarTrainedDateSet.has(cell.dateKey)
                          ? selectedActivityDate === cell.dateKey
                            ? 'calendar-day trained selected'
                            : 'calendar-day trained'
                          : 'calendar-day'
                    }
                    key={cell?.dateKey ?? `blank-${index}`}
                    onClick={() => cell && setSelectedActivityDate(cell.dateKey)}
                    disabled={cell == null}
                  >
                    {cell && (
                      <>
                        <span>{cell.day}</span>
                        {calendarTrainedDateSet.has(cell.dateKey) && <small />}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </article>
          </section>

          <section className="activity-date-detail">
            <div className="activity-date-head">
              <div>
                <span>선택 날짜</span>
                <strong>{formatWorkoutDateLabel(selectedActivityDate)}</strong>
              </div>
              <p>
                {selectedDateStats.exerciseCount}개 운동 · {selectedDateStats.setCount}세트 ·{' '}
                {Math.round(selectedDateStats.volume).toLocaleString()}kg
              </p>
            </div>
            {selectedDateSessions.length === 0 && <p className="empty">이 날짜에는 저장된 운동이 없습니다.</p>}
            {selectedDateSessions.map((session) => {
              const stats = getSessionStats(session);
              return (
                <button
                  className="activity-session-detail"
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setSummarySessionId(session.id);
                    setActiveView('summary');
                  }}
                >
                  <div>
                    <strong>{stats.exerciseCount}개 운동</strong>
                    <span>{stats.parts.join(', ') || '부위 기록 없음'}</span>
                  </div>
                  <p>{stats.setCount}세트 · {Math.round(stats.volume).toLocaleString()}kg</p>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </section>

          <div className="session-gallery">
            {sessions.length === 0 && (
              <article className="session-tile empty-tile">
                <CalendarDays size={28} />
                <strong>아직 저장된 세션이 없습니다.</strong>
                <span>첫 기록을 저장하면 최근 세션 카드가 만들어집니다.</span>
              </article>
            )}
            {sessions.slice(0, 6).map((session) => (
              <button
                className="session-tile"
                key={session.id}
                type="button"
                onClick={() => {
                  setSummarySessionId(session.id);
                  setActiveView('summary');
                }}
              >
                <div className="tile-overlay">
                  <span>{session.workoutDate}</span>
                  <strong>{session.records.map((record) => record.machineName).join(', ')}</strong>
                  <small>
                    {session.durationSeconds ? formatDuration(session.durationSeconds) : '기록 세션'} ·{' '}
                    {session.records.map((record) => record.muscleGroupLabel).join(', ')}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </section>
        )}
      </section>
    </main>
  );
}
