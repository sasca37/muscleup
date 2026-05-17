import {
  Activity,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  Dumbbell,
  History,
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
import { muscleGroups } from './data/muscleGroups';
import type {
  CreateWorkoutPayload,
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

const today = new Date().toISOString().slice(0, 10);
const loginRequestedKey = 'muscle-log-login-requested';
const restDurationKey = 'muscle-log-rest-duration';
const defaultRestSeconds = 60;
const minRestSeconds = 10;
const maxRestSeconds = 300;

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

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [machines, setMachines] = useState<ExerciseMachine[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup>('CHEST');
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [history, setHistory] = useState<MachineHistory[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [workoutDate, setWorkoutDate] = useState(today);
  const [memo, setMemo] = useState('');
  const [note, setNote] = useState('');
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
    const params = new URLSearchParams(window.location.search);
    const shouldCheckSession =
      window.localStorage.getItem(loginRequestedKey) === 'true' || params.has('login');

    if (!shouldCheckSession) {
      setAuthChecked(true);
      return;
    }

    api.me()
      .then((currentUser) => {
        window.localStorage.setItem(loginRequestedKey, 'true');
        setUser(currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem(loginRequestedKey);
        setUser(null);
      })
      .finally(() => {
        if (params.has('login')) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    api.machines(selectedGroup)
      .then((result) => {
        setMachines(result);
        setSelectedMachineId((current) => current ?? result[0]?.id ?? null);
      })
      .catch(() => setError('운동 기구 목록을 불러오지 못했습니다.'));
  }, [selectedGroup, user]);

  useEffect(() => {
    if (!user || selectedMachineId == null) {
      return;
    }

    api.machineHistory(selectedMachineId)
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [selectedMachineId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    api.workouts()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [user]);

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

  const selectedMachine = useMemo(
    () => machines.find((machine) => machine.id === selectedMachineId) ?? null,
    [machines, selectedMachineId],
  );

  const totalDraftSets = sets.filter((set) => set.weightKg && set.reps).length;
  const latestHistory = history[0];

  if (!authChecked) {
    return <main className="loading">로그인 상태 확인 중</main>;
  }

  if (!user) {
    return <LoginGate />;
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

  async function submitWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMachineId) {
      return;
    }

    const validSets = sets
      .map((set) => ({
        weightKg: Number(set.weightKg),
        reps: Number(set.reps),
      }))
      .filter((set) => Number.isFinite(set.weightKg) && set.weightKg >= 0 && set.reps > 0);

    if (validSets.length === 0) {
      setError('최소 1개 이상의 세트를 입력하세요.');
      return;
    }

    const payload: CreateWorkoutPayload = {
      workoutDate,
      memo,
      records: [
        {
          machineId: selectedMachineId,
          note,
          sets: validSets,
        },
      ],
    };

    setSaving(true);
    setError(null);

    try {
      const created = await api.createWorkout(payload);
      setSessions((current) => [created, ...current]);
      const nextHistory = await api.machineHistory(selectedMachineId);
      setHistory(nextHistory);
      resetDraft();
    } catch {
      setError('운동 기록 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-wordmark">MUSCLE LOG</div>
        <nav className="main-nav" aria-label="주요 메뉴">
          <a href="#home">홈</a>
          <a className="active" href="#record">운동기록</a>
          <a href="#history">히스토리</a>
          <a href="#activity">내 활동</a>
        </nav>
        <div className="user-chip">
          <UserRound size={18} />
          <span>{user.displayName}</span>
        </div>
      </header>

      <section className="hero-band" id="home">
        <div className="hero-glow" />
        <div className="hero-content">
          <span>오늘의 운동 기록</span>
          <h1>
            방금 한 세트까지
            <br />
            기구별로 남겨볼까요?
          </h1>
          <a href="#record">기록 시작하기</a>
        </div>
      </section>

      <section className="content-shell" id="record">
        <div className="section-heading">
          <div>
            <h2>{machines.length}개의 운동 기구를 선택할 수 있어요!</h2>
            <p>부위를 고르고 오늘 수행한 기구를 선택하세요.</p>
          </div>
          <button className="link-button" type="button">
            전체보기
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="segment-control">
          {muscleGroups.map((group) => (
            <button
              className={selectedGroup === group.value ? 'active' : ''}
              key={group.value}
              type="button"
              onClick={() => {
                setSelectedGroup(group.value);
                setSelectedMachineId(null);
              }}
            >
              {group.label}
            </button>
          ))}
        </div>

        <div className="machine-card-grid">
          {machines.map((machine) => (
            <button
              className={selectedMachineId === machine.id ? 'machine-card selected' : 'machine-card'}
              key={machine.id}
              type="button"
              onClick={() => setSelectedMachineId(machine.id)}
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
              </div>
            </button>
          ))}
        </div>

        <section className="record-layout">
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

            <div className="form-row">
              <label>
                <span>운동일</span>
                <input value={workoutDate} onChange={(event) => setWorkoutDate(event.target.value)} type="date" />
              </label>
              <label>
                <span>세션 메모</span>
                <input value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="예: 하체 볼륨 데이" />
              </label>
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
                    onClick={() => toggleSetComplete(set.id)}
                  >
                    <CheckCircle2 size={16} />
                    {set.completed ? '완료됨' : '완료'}
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

        <section className="session-section" id="activity">
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
          <div className="session-gallery">
            {sessions.length === 0 && (
              <article className="session-tile empty-tile">
                <CalendarDays size={28} />
                <strong>아직 저장된 세션이 없습니다.</strong>
                <span>첫 기록을 저장하면 최근 세션 카드가 만들어집니다.</span>
              </article>
            )}
            {sessions.slice(0, 6).map((session) => (
              <article className="session-tile" key={session.id}>
                <div className="tile-overlay">
                  <span>{session.workoutDate}</span>
                  <strong>{session.records.map((record) => record.machineName).join(', ')}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
