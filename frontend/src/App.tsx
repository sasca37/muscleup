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
  Share2,
  Star,
  Timer,
  Trophy,
  Trash2,
  UserRound,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api/client';
import { LoginGate } from './components/LoginGate';
import { MarketQuotePanel } from './components/MarketQuotePanel';
import { muscleGroups } from './data/muscleGroups';
import { mockMachines } from './data/mockMachines';
import type {
  ExerciseMachine,
  MachineHistory,
  MuscleGroup,
  User,
  WorkoutSession,
  WorkoutSet,
} from './types/domain';

type DraftSet = {
  id: number;
  weightKg: string;
  reps: string;
  completed: boolean;
  remainingSeconds: number;
};

type ActiveView = 'home' | 'planner' | 'record' | 'oneRm' | 'activity' | 'summary';
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
  sessionId: string;
  machineName: string;
  muscleGroupLabel: string;
  setsCount: number;
  sets: {
    weightKg: string | number;
    reps: number;
  }[];
  workoutDate: string;
};

type AppRoute = {
  view: ActiveView;
  summarySessionId: string | null;
};

const today = new Date().toISOString().slice(0, 10);
const mockSessionKey = 'repick-mock-session';
const legacyMockSessionKey = 'muscle-log-mock-session';
const restDurationKey = 'repick-rest-duration';
const favoriteExercisesKeyPrefix = 'repick-favorite-exercises';
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

function parseAppRoute(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const summaryMatch = path.match(/^\/summary\/([^/]+)$/);

  if (summaryMatch) {
    return {
      view: 'summary',
      summarySessionId: decodeURIComponent(summaryMatch[1]),
    };
  }

  if (path === '/planner') {
    return { view: 'planner', summarySessionId: null };
  }

  if (path === '/record') {
    return { view: 'record', summarySessionId: null };
  }

  if (path === '/one-rm') {
    return { view: 'oneRm', summarySessionId: null };
  }

  if (path === '/activity') {
    return { view: 'activity', summarySessionId: null };
  }

  return { view: 'home', summarySessionId: null };
}

function getAppRoutePath(view: ActiveView, summarySessionId?: string | null) {
  if (view === 'planner') {
    return '/planner';
  }

  if (view === 'record') {
    return '/record';
  }

  if (view === 'oneRm') {
    return '/one-rm';
  }

  if (view === 'activity') {
    return '/activity';
  }

  if (view === 'summary' && summarySessionId) {
    return `/summary/${encodeURIComponent(summarySessionId)}`;
  }

  return '/';
}

function createDraftSet(): DraftSet {
  return {
    id: Date.now() + Math.floor(Math.random() * 100000),
    weightKg: '',
    reps: '',
    completed: false,
    remainingSeconds: 0,
  };
}

function createDraftSetFromHistory(set?: WorkoutSet): DraftSet {
  return {
    ...createDraftSet(),
    weightKg: set?.weightKg == null ? '' : String(set.weightKg),
    reps: set?.reps == null ? '' : String(set.reps),
  };
}

function formatPreviousSet(set?: WorkoutSet, draftSet?: DraftSet) {
  if (!set) {
    return null;
  }

  const previousWeight = Number(set.weightKg);
  const currentWeight = Number(draftSet?.weightKg);
  const currentReps = Number(draftSet?.reps);
  const changes: string[] = [];

  if (Number.isFinite(previousWeight) && Number.isFinite(currentWeight) && draftSet?.weightKg !== '') {
    const weightDiff = currentWeight - previousWeight;
    if (weightDiff !== 0) {
      changes.push(`${weightDiff > 0 ? '+' : ''}${weightDiff}kg`);
    }
  }

  if (Number.isFinite(currentReps) && draftSet?.reps !== '') {
    const repsDiff = currentReps - set.reps;
    if (repsDiff !== 0) {
      changes.push(`${repsDiff > 0 ? '+' : ''}${repsDiff}회`);
    }
  }

  const comparison = changes.length > 0 ? changes.join(' / ') : draftSet?.weightKg || draftSet?.reps ? '지난과 동일' : null;
  return comparison
    ? `지난 ${set.weightKg}kg x ${set.reps}회 · ${comparison}`
    : `지난 ${set.weightKg}kg x ${set.reps}회`;
}

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, '0')}`;
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

const exerciseAssetRules: { keywords: string[]; assetUrl: string }[] = [
  {
    keywords: ['인클라인', 'incline'],
    assetUrl: '/exercises/incline-press-anatomy.png',
  },
  {
    keywords: ['플라이', '펙덱', '크로스오버', 'fly', 'pec deck', 'crossover'],
    assetUrl: '/exercises/chest-fly-anatomy.png',
  },
  {
    keywords: ['벤치', '체스트 프레스', '디클라인', '푸쉬업', '푸시업', '딥스', 'bench', 'chest press', 'push up', 'pushup', 'dip'],
    assetUrl: '/exercises/bench-press-anatomy.png',
  },
  {
    keywords: ['랫풀', '풀다운', '풀업', '스트레이트 암', '풀오버', 'lat', 'pulldown', 'pullup', 'pull up', 'pullover'],
    assetUrl: '/exercises/lat-pulldown-anatomy.png',
  },
  {
    keywords: ['시티드 로우', '티바 로우', '덤벨 로우', '하이 로우', '로우 머신', 'seated row', 't-bar', 'tbar', 'dumbbell row', 'high row'],
    assetUrl: '/exercises/seated-row-anatomy.png',
  },
  {
    keywords: ['데드리프트', '루마니안', '백 익스텐션', 'deadlift', 'romanian', 'back extension'],
    assetUrl: '/exercises/deadlift-anatomy.png',
  },
  {
    keywords: ['레그 프레스', 'leg press'],
    assetUrl: '/exercises/leg-press-anatomy.png',
  },
  {
    keywords: ['레그 익스텐션', 'leg extension'],
    assetUrl: '/exercises/leg-extension-anatomy.png',
  },
  {
    keywords: ['레그 컬', 'leg curl'],
    assetUrl: '/exercises/leg-curl-anatomy.png',
  },
  {
    keywords: ['힙 쓰러스트', '힙 어브덕션', 'hip thrust', 'abduction'],
    assetUrl: '/exercises/hip-thrust-anatomy.png',
  },
  {
    keywords: ['카프', 'calf'],
    assetUrl: '/exercises/calf-raise-anatomy.png',
  },
  {
    keywords: ['스쿼트', '런지', 'squat', 'lunge'],
    assetUrl: '/exercises/squat-anatomy.png',
  },
  {
    keywords: ['숄더 프레스', '오버헤드프레스', '오버헤드 프레스', 'shoulder press', 'overhead press'],
    assetUrl: '/exercises/shoulder-press-anatomy.png',
  },
  {
    keywords: ['리어 델트', '페이스 풀', 'rear delt', 'face pull'],
    assetUrl: '/exercises/rear-delt-fly-anatomy.png',
  },
  {
    keywords: ['레터럴', '숄더 레이즈', '업라이트', '프론트 레이즈', 'lateral', 'upright row', 'front raise'],
    assetUrl: '/exercises/lateral-raise-anatomy.png',
  },
  {
    keywords: ['푸시다운', '트라이셉스', '스컬 크러셔', 'triceps', 'pushdown', 'skull crusher'],
    assetUrl: '/exercises/triceps-pushdown-anatomy.png',
  },
  {
    keywords: ['암 컬', '덤벨 컬', '해머 컬', '프리처 컬', '로프 컬', '리버스 컬', 'biceps', 'curl', 'hammer curl', 'preacher curl'],
    assetUrl: '/exercises/biceps-curl-anatomy.png',
  },
  {
    keywords: ['크런치', '토르소', '팔로프', 'crunch', 'torso', 'pallof'],
    assetUrl: '/exercises/cable-crunch-anatomy.png',
  },
  {
    keywords: ['플랭크', '레그레이즈', '데드버그', '롤아웃', '마운틴 클라이머', 'plank', 'leg raise', 'dead bug', 'rollout', 'mountain climber'],
    assetUrl: '/exercises/plank-anatomy.png',
  },
];

function getExerciseAssetUrl(name: string) {
  const normalizedName = name.toLowerCase();
  const compactName = normalizedName.replace(/\s+/g, '');

  return (
    exerciseAssetRules.find((rule) =>
      rule.keywords.some((keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        return normalizedName.includes(normalizedKeyword) || compactName.includes(normalizedKeyword.replace(/\s+/g, ''));
      }),
    )?.assetUrl ?? null
  );
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

function getWorkoutRecordVolume(record: WorkoutSession['records'][number]) {
  return record.sets.reduce((total, set) => total + Number(set.weightKg) * set.reps, 0);
}

function getWorkoutRecordMaxWeight(record: WorkoutSession['records'][number]) {
  return record.sets.reduce((best, set) => {
    const weight = Number(set.weightKg);
    return Number.isFinite(weight) ? Math.max(best, weight) : best;
  }, 0);
}

function getWorkoutRecordOneRm(record: WorkoutSession['records'][number]) {
  return record.sets.reduce((best, set) => {
    const weight = Number(set.weightKg);
    if (!Number.isFinite(weight) || set.reps < 1) {
      return best;
    }

    return Math.max(best, weight * (1 + set.reps / 30));
  }, 0);
}

function loadSummaryImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawRoundedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const imageRatio = image.width / image.height;
  const targetRatio = width / height;
  const sourceWidth = imageRatio > targetRatio ? image.height * targetRatio : image.width;
  const sourceHeight = imageRatio > targetRatio ? image.height : image.width / targetRatio;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  context.save();
  drawRoundedRect(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine;
      return;
    }
    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
}

function formatShareDateTime(session: WorkoutSession) {
  const rawDate = session.finishedAt ?? session.startedAt;
  if (!rawDate) {
    return session.workoutDate.replace(/-/g, '.');
  }

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) {
    return session.workoutDate.replace(/-/g, '.');
  }

  const year = String(date.getFullYear()).slice(-2);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} · ${hour}:${minute}`;
}

function getShareWorkoutTitle(parts: string[]) {
  if (parts.length === 0) {
    return '오늘 운동';
  }

  return parts.slice(0, 3).join(' · ');
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
  const initialRoute = useMemo(parseAppRoute, []);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
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
  const [finishConfirmOpen, setFinishConfirmOpen] = useState(false);
  const [summarySessionId, setSummarySessionId] = useState<string | null>(initialRoute.summarySessionId);
  const [selectedActivityDate, setSelectedActivityDate] = useState(today);
  const [recordVisualMode, setRecordVisualMode] = useState<RecordVisualMode>('market');
  const [favoriteMachineIds, setFavoriteMachineIds] = useState<Set<number>>(() => new Set());
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

  function navigateToView(view: ActiveView, nextSummarySessionId: string | null = null) {
    setActiveView(view);
    setSummarySessionId(view === 'summary' ? nextSummarySessionId : null);

    const nextPath = getAppRoutePath(view, nextSummarySessionId);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ view, summarySessionId: nextSummarySessionId }, '', nextPath);
    }
  }

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
    function handlePopState() {
      const route = parseAppRoute();
      setActiveView(route.view);
      setSummarySessionId(route.summarySessionId);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const storedFavorites = window.localStorage.getItem(`${favoriteExercisesKeyPrefix}:${user.id}`);
    if (storedFavorites) {
      try {
        setFavoriteMachineIds(new Set((JSON.parse(storedFavorites) as number[]).filter(Number.isFinite)));
      } catch {
        setFavoriteMachineIds(new Set());
      }
    } else {
      setFavoriteMachineIds(new Set());
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
      if (current != null && exerciseMachines.some((machine) => machine.id === current)) {
        return current;
      }
      return null;
    });
  }, [exerciseMachines]);

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
    () => exerciseMachines.find((machine) => machine.id === selectedMachineId) ?? null,
    [exerciseMachines, selectedMachineId],
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
  const visibleWorkoutRecords = workoutStartedAt == null ? [] : activeWorkoutRecords;
  const visibleWorkoutParts = Array.from(new Set(visibleWorkoutRecords.map((record) => record.muscleGroupLabel)));
  const visibleWorkoutSetCount = visibleWorkoutRecords.reduce((total, record) => total + record.setsCount, 0);
  const favoriteMachines = exerciseMachines.filter((machine) => favoriteMachineIds.has(machine.id));
  const recentMachines = useMemo(() => {
    const seenMachineIds = new Set<number>();
    const recentMachineIds = sessions.flatMap((session) =>
      [...session.records].reverse().map((record) => record.machineId),
    );

    return recentMachineIds
      .filter((machineId) => {
        if (seenMachineIds.has(machineId)) {
          return false;
        }
        seenMachineIds.add(machineId);
        return true;
      })
      .map((machineId) => exerciseMachines.find((machine) => machine.id === machineId))
      .filter((machine): machine is ExerciseMachine => Boolean(machine))
      .slice(0, 8);
  }, [exerciseMachines, sessions]);
  const quickPickMachines = [
    ...favoriteMachines.slice(0, 8),
    ...recentMachines.filter((machine) => !favoriteMachineIds.has(machine.id)).slice(0, 8),
  ].slice(0, 10);
  const summarySession =
    sessions.find((session) => session.id === summarySessionId) ??
    sessions.find((session) => session.status === 'FINISHED' && session.workoutDate === today) ??
    null;
  const summaryStats = getSessionStats(summarySession);
  const summaryTotalReps = summarySession?.records.reduce(
    (total, record) => total + record.sets.reduce((setTotal, set) => setTotal + set.reps, 0),
    0,
  ) ?? 0;
  const summaryDurationMinutes = summarySession?.durationSeconds
    ? Math.max(1, Math.round(summarySession.durationSeconds / 60))
    : 0;
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
  const calendarDateSessionCountMap = sessions.reduce<Record<string, number>>((countsByDate, session) => {
    const sessionDate = new Date(`${session.workoutDate}T00:00:00`);
    if (sessionDate.getFullYear() !== calendarYear || sessionDate.getMonth() !== calendarMonth) {
      return countsByDate;
    }

    return {
      ...countsByDate,
      [session.workoutDate]: (countsByDate[session.workoutDate] ?? 0) + 1,
    };
  }, {});
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
      sessionId: session.id,
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
    navigateToView('record');
  }

  async function finishWorkout() {
    setFinishConfirmOpen(false);
    let nextSummarySessionId = activeSessionId;
    const sessionToFinish = activeSessionId
      ? sessions.find((session) => session.id === activeSessionId)
      : null;
    const recordCount = sessionToFinish?.records.length ?? activeWorkoutRecords.length;

    if (recordCount === 0) {
      setError('운동을 1개 이상 추가한 뒤 종료할 수 있습니다.');
      setExercisePickerOpen(true);
      setExerciseFormOpen(false);
      navigateToView('record');
      return;
    }

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

    setWorkoutStartedAt(null);
    setActiveSessionId(null);
    setExercisePickerOpen(false);
    setExerciseFormOpen(false);
    setCustomExerciseOpen(false);
    navigateToView('summary', nextSummarySessionId);
  }

  async function openExercisePicker() {
    setSelectedMachineId(null);
    setExerciseFormOpen(false);
    setExercisePickerOpen(true);
    navigateToView('record');
  }

  function requestFinishWorkout() {
    setError(null);
    setFinishConfirmOpen(true);
    setExercisePickerOpen(false);
    setExerciseFormOpen(false);
    navigateToView('record');
  }

  function closeExercisePickerStep() {
    if (exerciseFormOpen) {
      setSelectedMachineId(null);
      setExerciseFormOpen(false);
      return;
    }

    setExercisePickerOpen(false);
  }

  function findMachineHistory(machineId: number): MachineHistory[] {
    return sessions
      .flatMap((session) =>
        [...session.records].reverse()
          .filter((record) => record.machineId === machineId)
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
  }

  function selectMachineForRecord(machine: ExerciseMachine) {
    const latestRecord = findMachineHistory(machine.id)[0];
    setSelectedGroup(machine.muscleGroup);
    setSelectedMachineId(machine.id);
    setExerciseFormOpen(true);
    setNote('');

    if (latestRecord?.sets.length) {
      setSets(latestRecord.sets.map(createDraftSetFromHistory));
      return;
    }

    setSets([createDraftSet(), createDraftSet(), createDraftSet()]);
  }

  function toggleFavoriteMachine(machineId: number) {
    if (!user) {
      return;
    }

    const nextFavoriteIds = new Set(favoriteMachineIds);
    if (nextFavoriteIds.has(machineId)) {
      nextFavoriteIds.delete(machineId);
    } else {
      nextFavoriteIds.add(machineId);
    }

    setFavoriteMachineIds(nextFavoriteIds);
    window.localStorage.setItem(
      `${favoriteExercisesKeyPrefix}:${user.id}`,
      JSON.stringify(Array.from(nextFavoriteIds)),
    );
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

  async function deleteWorkoutRecord(sessionId: string, recordId: string) {
    setError(null);

    if (isLocalSession(sessionId) || !user) {
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId
            ? { ...session, records: session.records.filter((record) => record.id !== recordId) }
            : session,
        ),
      );
      setActiveWorkoutRecords((current) => current.filter((record) => record.id !== recordId));
      return;
    }

    try {
      const updatedSession = await api.deleteWorkoutRecord(user.id, sessionId, recordId);
      upsertSession(updatedSession);
      if (activeSessionId === sessionId) {
        setActiveWorkoutRecords(toActiveWorkoutRecords(updatedSession));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '운동 기록 삭제에 실패했습니다.');
    }
  }

  async function deleteWorkoutSession(sessionId: string) {
    setError(null);

    if (!isLocalSession(sessionId) && user) {
      try {
        await api.deleteWorkoutSession(user.id, sessionId);
      } catch (error) {
        setError(error instanceof Error ? error.message : '운동 세션 삭제에 실패했습니다.');
        return;
      }
    }

    setSessions((current) => current.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setWorkoutStartedAt(null);
      setWorkoutElapsedSeconds(0);
      setActiveWorkoutRecords([]);
    }
    if (summarySessionId === sessionId) {
      navigateToView('activity');
    }
  }

  async function shareWorkoutSummaryImage(session: WorkoutSession) {
    const stats = getSessionStats(session);
    const totalReps = session.records.reduce(
      (total, record) => total + record.sets.reduce((setTotal, set) => setTotal + set.reps, 0),
      0,
    );
    const durationMinutes = session.durationSeconds ? Math.max(1, Math.round(session.durationSeconds / 60)) : 0;
    const shareRecords = session.records;
    const shareSetColumns = 4;
    const shareSetRowGap = 76;
    const shareSetBlockBottomPadding = 112;
    const shareRecordRows = [];
    for (let index = 0; index < shareRecords.length; index += 2) {
      const rowRecords = shareRecords.slice(index, index + 2);
      const rowHeight = rowRecords.reduce((height, record) => {
        const setRows = Math.max(1, Math.ceil(record.sets.length / shareSetColumns));
        const setStartOffset = record.note ? 118 : 94;
        const setBlockHeight = setStartOffset + (setRows - 1) * shareSetRowGap + shareSetBlockBottomPadding;
        return Math.max(height, Math.max(176, setBlockHeight));
      }, 176);
      shareRecordRows.push({ records: rowRecords, height: rowHeight });
    }
    const shareContentHeight = shareRecordRows.reduce((total, row) => total + row.height, 0);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = Math.max(1080, 296 + shareContentHeight + 72);
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const headerGradient = context.createLinearGradient(0, 0, canvas.width, 230);
    headerGradient.addColorStop(0, '#cbe8ff');
    headerGradient.addColorStop(0.55, '#d9e9ff');
    headerGradient.addColorStop(1, '#eadcff');
    context.fillStyle = headerGradient;
    context.fillRect(0, 0, canvas.width, 230);

    context.textAlign = 'left';
    context.fillStyle = '#2c7df0';
    context.font = '900 24px Arial, sans-serif';
    context.fillText(formatShareDateTime(session), 46, 56);
    context.font = '900 38px Arial, sans-serif';
    context.fillText(getShareWorkoutTitle(stats.parts), 46, 104);

    drawRoundedRect(context, 936, 28, 98, 48, 14);
    context.fillStyle = '#ffffff';
    context.fill();
    context.fillStyle = '#3f7df6';
    context.font = '900 18px Arial, sans-serif';
    context.textAlign = 'center';
    context.fillText('Repick', 985, 59);

    const metrics = [
      [`${durationMinutes || '-'}분`, 'clock'],
      [`${stats.setCount}세트`, 'check'],
      [`${totalReps}회`, 'reps'],
      [`${Math.round(stats.volume).toLocaleString()} kg`, 'volume'],
    ];

    const chipWidths = [132, 150, 130, 258];
    let chipX = 46;
    metrics.forEach(([value, type], index) => {
      const width = chipWidths[index];
      drawRoundedRect(context, chipX, 142, width, 44, 22);
      context.fillStyle = 'rgba(255, 255, 255, 0.58)';
      context.fill();
      context.textAlign = 'center';
      context.font = '900 20px Arial, sans-serif';
      context.fillStyle = type === 'volume' ? '#168c94' : '#536274';
      const icon = type === 'clock' ? '◷' : type === 'check' ? '✓' : type === 'reps' ? '↻' : '🏋';
      context.fillText(`${icon}  ${value}`, chipX + width / 2, 171);
      chipX += width + 14;
    });

    let rowY = 296;
    for (let rowIndex = 0; rowIndex < shareRecordRows.length; rowIndex++) {
      const row = shareRecordRows[rowIndex];
      if (rowIndex > 0) {
        context.strokeStyle = '#eef1f6';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(46, rowY - 34);
        context.lineTo(1034, rowY - 34);
        context.stroke();
      }

      for (let column = 0; column < row.records.length; column++) {
        const record = row.records[column];
        const x = column === 0 ? 46 : 560;
        const assetUrl = getExerciseAssetUrl(record.machineName);
        if (assetUrl) {
          try {
            const image = await loadSummaryImage(assetUrl);
            drawRoundedImage(context, image, x, rowY - 28, 86, 86, 16);
          } catch {
            drawRoundedRect(context, x, rowY - 28, 86, 86, 16);
            context.fillStyle = '#f2f6fb';
            context.fill();
          }
        } else {
          drawRoundedRect(context, x, rowY - 28, 86, 86, 16);
          context.fillStyle = '#f2f6fb';
          context.fill();
        }

        context.textAlign = 'left';
        context.fillStyle = '#3d4856';
        context.font = '900 26px Arial, sans-serif';
        drawWrappedText(context, record.machineName, x + 112, rowY, 350, 32, 2);
        context.fillStyle = '#8a96a6';
        context.font = '800 20px Arial, sans-serif';
        context.fillText(`${Math.round(getWorkoutRecordVolume(record)).toLocaleString()} kg`, x + 112, rowY + 56);
        if (record.note) {
          context.fillStyle = '#697484';
          context.font = '700 17px Arial, sans-serif';
          drawWrappedText(context, record.note, x + 112, rowY + 82, 350, 22, 1);
        }

        const setStartY = record.note ? rowY + 118 : rowY + 94;
        record.sets.forEach((set, setIndex) => {
          const setX = x + (setIndex % shareSetColumns) * 84;
          const setY = setStartY + Math.floor(setIndex / shareSetColumns) * shareSetRowGap;
          drawRoundedRect(context, setX, setY, 64, 40, 20);
          context.fillStyle = '#0a66d8';
          context.fill();
          context.fillStyle = '#ffffff';
          context.textAlign = 'center';
          context.font = '900 24px Arial, sans-serif';
          context.fillText(String(set.weightKg), setX + 32, setY + 28);
          context.fillStyle = '#697484';
          context.font = '900 16px Arial, sans-serif';
          context.fillText(`${set.reps}X`, setX + 32, setY + 58);
        });
      }

      rowY += row.height;
    }

    context.textAlign = 'center';
    context.fillStyle = '#a4afbd';
    context.font = '800 18px Arial, sans-serif';
    context.fillText('오늘 한 세트가 다음 운동의 기준이 되게 · Repick', 540, canvas.height - 40);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      return;
    }

    const file = new File([blob], `repick-${session.workoutDate}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
      });
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
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
    setFinishConfirmOpen(false);
    setSummarySessionId(null);
    setSessions([]);
    setFavoriteMachineIds(new Set());
    setUser(null);
    navigateToView('home');
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
          sessionId,
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
        <button className="brand-wordmark brand-home-button" type="button" onClick={() => navigateToView('home')}>
          Repick
        </button>
        <nav className="main-nav" aria-label="주요 메뉴">
          <button className={activeView === 'home' ? 'active' : ''} type="button" onClick={() => navigateToView('home')}>
            홈
          </button>
          <button className={activeView === 'planner' ? 'active' : ''} type="button" onClick={() => navigateToView('planner')}>
            루틴설계
          </button>
          <button className={activeView === 'record' ? 'active' : ''} type="button" onClick={() => navigateToView('record')}>
            운동기록
          </button>
          <button className={activeView === 'oneRm' ? 'active' : ''} type="button" onClick={() => navigateToView('oneRm')}>
            1RM
          </button>
          <button className={activeView === 'activity' ? 'active' : ''} type="button" onClick={() => navigateToView('activity')}>
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
          <button type="button" onClick={() => navigateToView('record')}>
            {workoutStartedAt == null ? '운동 기록 열기' : '운동 이어가기'}
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
              <button className="link-button" type="button" onClick={() => navigateToView('record')}>
                {workoutStartedAt == null ? '운동 기록 열기' : '운동 이어가기'}
                <ChevronRight size={16} />
              </button>
            </div>

            <section className={workoutStartedAt == null ? 'workout-status-card' : 'workout-status-card active'}>
              <div className="workout-status-main">
                <span>{workoutStartedAt == null ? 'Ready' : 'Live workout'}</span>
                <strong>{workoutStartedAt == null ? '오늘 운동을 시작해볼까요?' : formatSeconds(workoutElapsedSeconds)}</strong>
                <p>
                  {workoutStartedAt == null
                    ? '운동기록 화면에서 시작을 누르면 운동 시간이 기록되고, 저장한 종목과 부위가 세션 요약에 쌓입니다.'
                    : `${activeWorkoutRecords.length}개 운동, ${activeWorkoutSetCount}세트 진행 중`}
                </p>
              </div>
              <div className="workout-status-actions">
                {workoutStartedAt == null ? (
                  <button className="primary-button" type="button" onClick={() => navigateToView('record')}>
                    <Timer size={16} />
                    운동 기록 열기
                  </button>
                ) : (
                  <>
                    <button className="secondary-button" type="button" onClick={openExercisePicker}>
                      <Plus size={16} />
                      기록 추가
                    </button>
                    <button className="primary-button" type="button" onClick={requestFinishWorkout}>
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
              <button type="button" onClick={() => navigateToView('planner')}>
                <strong>AI 루틴 설계</strong>
                <span>프로필과 분할 방식을 고르면 주간 플랜 초안을 만듭니다.</span>
              </button>
              <button type="button" onClick={() => navigateToView('oneRm')}>
                <strong>1RM 계산기</strong>
                <span>주요 리프트의 예상 최대 중량을 빠르게 계산합니다.</span>
              </button>
              <button type="button" onClick={() => navigateToView('activity')}>
                <strong>내 활동 보기</strong>
                <span>캘린더와 날짜별 세션 상세를 확인합니다.</span>
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
              <button className="link-button" type="button" onClick={() => navigateToView('record')}>
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
                  onClick={workoutStartedAt == null ? startWorkout : requestFinishWorkout}
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

            <section
              className={[
                'workout-log-stage',
                workoutStartedAt == null ? '' : 'active',
                recordVisualMode === 'market' ? 'market-stage' : '',
              ].filter(Boolean).join(' ')}
            >
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
              </div>

              <div
                className={recordVisualMode === 'market' ? 'muscle-visual-card market-mode' : 'muscle-visual-card'}
                aria-label={recordVisualMode === 'market' ? '운동 중 주식 차트' : '오늘 운동 부위 비주얼'}
              >
                {recordVisualMode === 'market' && user && <MarketQuotePanel userId={user.id} />}
              </div>

              <div className="workout-log-list">
                {visibleWorkoutRecords.length === 0 && (
                  <article className="workout-log-empty">
                    <span className="workout-empty-icon">
                      <Dumbbell size={22} />
                    </span>
                    <div>
                      <strong>아직 추가된 운동이 없습니다</strong>
                      <p>운동 추가를 누르면 부위별 운동 목록과 세트 입력 화면이 열립니다.</p>
                    </div>
                  </article>
                )}
                {visibleWorkoutRecords.map((record) => (
                  <article className="workout-log-item" key={`${record.id}-${record.workoutDate}`}>
                    <span
                      className="workout-log-thumb"
                      style={
                        getExerciseAssetUrl(record.machineName)
                          ? { backgroundImage: `url(${getExerciseAssetUrl(record.machineName)})` }
                          : undefined
                      }
                    >
                      {!getExerciseAssetUrl(record.machineName) && <Dumbbell size={24} />}
                    </span>
                    <div>
                      <strong>{record.machineName}</strong>
                      <p>{record.muscleGroupLabel} · {record.setsCount}세트</p>
                      <small>{formatWorkoutSetSummary(record.sets)}</small>
                    </div>
                    <button
                      className="delete-record-button"
                      type="button"
                      aria-label={`${record.machineName} 기록 삭제`}
                      onClick={() => deleteWorkoutRecord(record.sessionId, record.id)}
                    >
                      <Trash2 size={17} />
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
                  <button className="start-workout-button" type="button" onClick={requestFinishWorkout}>
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
                    onClick={closeExercisePickerStep}
                  >
                    닫기
                    <ChevronRight size={16} />
                  </button>
                </div>

                {!exerciseFormOpen && (
                  <>
                    {quickPickMachines.length > 0 && (
                      <section className="quick-machine-section" aria-label="빠른 운동 선택">
                        <div className="quick-machine-head">
                          <strong>바로 선택</strong>
                          <span>즐겨찾기와 최근 기록한 기구를 먼저 보여줍니다.</span>
                        </div>
                        <div className="quick-machine-list">
                          {quickPickMachines.map((machine) => (
                            <button
                              className={favoriteMachineIds.has(machine.id) ? 'quick-machine-pill favorite' : 'quick-machine-pill'}
                              key={`quick-${machine.id}`}
                              type="button"
                              onClick={() => selectMachineForRecord(machine)}
                            >
                              <span
                                className="quick-machine-thumb"
                                style={
                                  getExerciseAssetUrl(machine.name)
                                    ? { backgroundImage: `url(${getExerciseAssetUrl(machine.name)})` }
                                    : undefined
                                }
                              >
                                {!getExerciseAssetUrl(machine.name) && <Dumbbell size={16} />}
                              </span>
                              <span>
                                <strong>{machine.name}</strong>
                                <small>{favoriteMachineIds.has(machine.id) ? '즐겨찾기' : '최근 사용'}</small>
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

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
                            onClick={() => selectMachineForRecord(machine)}
                          >
                            <div className="machine-card-top">
                              <span
                                className="machine-avatar"
                                style={
                                  getExerciseAssetUrl(machine.name)
                                    ? { backgroundImage: `url(${getExerciseAssetUrl(machine.name)})` }
                                    : undefined
                                }
                              >
                                {!getExerciseAssetUrl(machine.name) && <Dumbbell size={18} />}
                              </span>
                            </div>
                            <strong>{machine.name}</strong>
                            <p>{machine.description}</p>
                            <div className="machine-tags">
                              <span>#{machine.muscleGroupLabel}</span>
                              <span>#{machine.movementPattern}</span>
                              {machine.custom && <span>#내기구</span>}
                            </div>
                          </button>
                          <button
                            className={favoriteMachineIds.has(machine.id) ? 'favorite-machine-button active' : 'favorite-machine-button'}
                            type="button"
                            aria-label={`${machine.name} 즐겨찾기 ${favoriteMachineIds.has(machine.id) ? '해제' : '추가'}`}
                            onClick={() => toggleFavoriteMachine(machine.id)}
                          >
                            <Star size={15} fill={favoriteMachineIds.has(machine.id) ? 'currentColor' : 'none'} />
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
                            placeholder="kg"
                            value={set.weightKg}
                            onChange={(event) => updateSet(set.id, 'weightKg', event.target.value)}
                          />
                          <input
                            inputMode="numeric"
                            placeholder="회"
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
                          {formatPreviousSet(latestHistory?.sets[index], set) && (
                            <small className="previous-set-hint">
                              {formatPreviousSet(latestHistory?.sets[index], set)}
                            </small>
                          )}
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
                        <h3>운동 중 현재가</h3>
                      </div>
                      <div className="compact-market-chart">
                        {user && <MarketQuotePanel userId={user.id} />}
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

            {finishConfirmOpen && (
              <div className="finish-confirm-backdrop" role="presentation">
                <section className="finish-confirm-dialog" role="dialog" aria-modal="true" aria-label="운동 종료 확인">
                  <div className="finish-confirm-icon">
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <span>운동 종료</span>
                    <h2>오늘 운동을 종료할까요?</h2>
                    <p>종료하면 현재 세션이 완료 처리되고 운동 완료 리포트로 이동합니다.</p>
                  </div>
                  <div className="finish-confirm-stats">
                    <article>
                      <strong>{visibleWorkoutRecords.length}</strong>
                      <span>운동</span>
                    </article>
                    <article>
                      <strong>{visibleWorkoutSetCount}</strong>
                      <span>세트</span>
                    </article>
                    <article>
                      <strong>{formatSeconds(workoutElapsedSeconds)}</strong>
                      <span>시간</span>
                    </article>
                  </div>
                  <div className="finish-confirm-actions">
                    <button className="secondary-button" type="button" onClick={() => setFinishConfirmOpen(false)}>
                      계속 기록하기
                    </button>
                    <button className="primary-button" type="button" onClick={finishWorkout}>
                      <CheckCircle2 size={16} />
                      종료하기
                    </button>
                  </div>
                </section>
              </div>
            )}
          </section>
        )}

        {activeView === 'oneRm' && (
          <section className="one-rm-page">
            <div className="section-heading">
              <div>
                <h2>1RM 계산기</h2>
                <p>Epley Formula로 스쿼트, 벤치프레스, 데드리프트, 오버헤드프레스의 예상 1RM을 계산합니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => navigateToView('record')}>
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
                <h2>운동 완료</h2>
                <p>{formatWorkoutDateLabel(summarySession.workoutDate)} 하루 운동을 멋지게 끝냈습니다.</p>
              </div>
              <button className="link-button" type="button" onClick={() => navigateToView('activity')}>
                내 활동에서 보기
                <ChevronRight size={16} />
              </button>
              <button className="summary-share-button" type="button" onClick={() => shareWorkoutSummaryImage(summarySession)}>
                <Share2 size={17} />
                공유하기
              </button>
              <button className="danger-link-button" type="button" onClick={() => deleteWorkoutSession(summarySession.id)}>
                <Trash2 size={16} />
                세션 삭제
              </button>
            </div>

            <section className="summary-showcase">
              <article className="summary-story-card">
                <div className="summary-story-top">
                  <span>{formatShareDateTime(summarySession)}</span>
                  <small>REPICK</small>
                </div>

                <div className="summary-story-header">
                  <strong>{getShareWorkoutTitle(summaryStats.parts)}</strong>
                </div>

                <div className="summary-story-stat-grid">
                  <div>
                    <strong>{summaryDurationMinutes || '-' }분</strong>
                    <span>운동시간</span>
                  </div>
                  <div>
                    <strong>{summaryStats.setCount}</strong>
                    <span>세트</span>
                  </div>
                  <div>
                    <strong>{summaryTotalReps}</strong>
                    <span>반복</span>
                  </div>
                  <div>
                    <strong>{Math.round(summaryStats.volume).toLocaleString()}</strong>
                    <span>kg</span>
                  </div>
                </div>

                <div className="summary-story-records">
                  {summarySession.records.map((record) => (
                    <article className="summary-story-record" key={record.id}>
                      <span
                        className="summary-story-record-image"
                        style={
                          getExerciseAssetUrl(record.machineName)
                            ? { backgroundImage: `url(${getExerciseAssetUrl(record.machineName)})` }
                            : undefined
                        }
                      >
                        {!getExerciseAssetUrl(record.machineName) && <Dumbbell size={24} />}
                      </span>
                      <div>
                        <strong>{record.machineName}</strong>
                        <span>{Math.round(getWorkoutRecordVolume(record)).toLocaleString()} kg</span>
                        {record.note && <p className="summary-story-note">{record.note}</p>}
                        <div className="summary-story-set-row">
                          {record.sets.map((set, index) => (
                            <span className="summary-story-set" key={`${record.id}-${index}`}>
                              <strong>{set.weightKg}</strong>
                              <small>{set.reps}X</small>
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
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
                        {calendarTrainedDateSet.has(cell.dateKey) && (
                          <small>{calendarDateSessionCountMap[cell.dateKey] ?? 1}</small>
                        )}
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
                <article
                  className="activity-session-detail"
                  key={session.id}
                >
                  <div>
                    <strong>{stats.exerciseCount}개 운동</strong>
                    <span>{stats.parts.join(', ') || '부위 기록 없음'}</span>
                  </div>
                  <p>{stats.setCount}세트 · {Math.round(stats.volume).toLocaleString()}kg</p>
                  <div className="activity-session-actions">
                    <button
                      type="button"
                      onClick={() => {
                        navigateToView('summary', session.id);
                      }}
                    >
                      상세
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="danger-icon-button"
                      type="button"
                      aria-label={`${session.workoutDate} 세션 삭제`}
                      onClick={() => deleteWorkoutSession(session.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

        </section>
        )}
      </section>
    </main>
  );
}
