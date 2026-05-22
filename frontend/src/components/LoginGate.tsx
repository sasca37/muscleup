import { Activity, Dumbbell, LogIn, TrendingUp, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import type { AgeGroup, Gender, RegisterPayload, User, WorkoutGoal } from '../types/domain';

type LoginGateProps = {
  onLoginSuccess: (user: User) => void;
};

type AuthMode = 'login' | 'register';

const workoutGoalOptions: { value: WorkoutGoal; label: string }[] = [
  { value: 'DIET', label: '다이어트' },
  { value: 'MUSCLE_GAIN', label: '근비대' },
  { value: 'HEALTH', label: '건강' },
];

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'MALE', label: '남' },
  { value: 'FEMALE', label: '여' },
];

const ageGroupOptions: { value: AgeGroup; label: string }[] = [
  { value: 'AGE_10S', label: '10대' },
  { value: 'AGE_20S', label: '20대' },
  { value: 'AGE_30S', label: '30대' },
  { value: 'AGE_40S', label: '40대' },
  { value: 'AGE_50S', label: '50대' },
  { value: 'AGE_60S', label: '60대' },
  { value: 'AGE_70S', label: '70대' },
  { value: 'AGE_80S', label: '80대' },
  { value: 'AGE_90S', label: '90대' },
];

export function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [workoutGoal, setWorkoutGoal] = useState<WorkoutGoal>('MUSCLE_GAIN');
  const [gender, setGender] = useState<Gender>('MALE');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('AGE_30S');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthError(null);
    setAuthOpen(true);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setAuthError(null);

    try {
      const user =
        authMode === 'login'
          ? await api.login({ email, password })
          : await api.register(createRegisterPayload());
      onLoginSuccess(user);
      setAuthOpen(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '요청 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  function createRegisterPayload(): RegisterPayload {
    return {
      email,
      password,
      nickname,
      workoutGoal,
      gender,
      ageGroup,
    };
  }

  return (
    <main className="login-shell">
      <header className="public-topbar">
        <button className="brand-wordmark brand-home-button" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Repick
        </button>
        <nav className="public-nav" aria-label="소개 메뉴">
          <a href="#features">기능</a>
          <a href="#preview">미리보기</a>
          <a href="#start">시작하기</a>
        </nav>
        <div className="public-auth-actions">
          <button
            aria-expanded={authOpen && authMode === 'login'}
            className="public-login-button"
            type="button"
            onClick={() => openAuth('login')}
          >
            <LogIn size={17} />
            로그인
          </button>
          <button
            aria-expanded={authOpen && authMode === 'register'}
            className="public-register-button"
            type="button"
            onClick={() => openAuth('register')}
          >
            <UserPlus size={17} />
            회원가입
          </button>
        </div>
      </header>

      <section className="public-hero" id="start">
        <div className="hero-glow" />
        <div className="public-copy">
          <span>운동 기록을 더 가볍게</span>
          <h1>
            오늘 한 세트,
            <br />
            다음 운동의 기준이 되게.
          </h1>
          <p>
            Repick은 운동 기구별 무게, 횟수, 이전 기록을 빠르게 확인하는 헬스 기록 서비스입니다.
          </p>
          <div className="public-actions">
            <button className="primary-button" type="button" onClick={() => openAuth('register')}>
              <UserPlus size={16} />
              회원가입하고 기록하기
            </button>
            <button className="secondary-auth-button" type="button" onClick={() => openAuth('login')}>
              <LogIn size={16} />
              로그인
            </button>
            <a className="secondary-link" href="#features">
              둘러보기
            </a>
          </div>
        </div>

        <div className="phone-preview" id="preview" aria-label="앱 화면 미리보기">
          <div className="phone-bar" />
          <div className="phone-card active">
            <div className="brand-mark">
              <Dumbbell size={22} />
            </div>
            <div>
              <strong>레그 프레스</strong>
              <span>120kg x 10 · 3세트</span>
            </div>
          </div>
          <div className="phone-card">
            <Activity size={20} />
            <div>
              <strong>오늘 입력</strong>
              <span>가슴 · 하체 루틴</span>
            </div>
          </div>
          <div className="phone-card">
            <TrendingUp size={20} />
            <div>
              <strong>이전 기록</strong>
              <span>지난 운동보다 +10kg</span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-features" id="features">
        <article>
          <Dumbbell size={22} />
          <strong>기구별 기록</strong>
          <span>부위와 머신을 고르고 세트별 무게와 횟수를 저장합니다.</span>
        </article>
        <article>
          <TrendingUp size={22} />
          <strong>이전 기록 확인</strong>
          <span>같은 기구를 선택하면 최근 수행 기록을 바로 볼 수 있습니다.</span>
        </article>
        <article>
          <Activity size={22} />
          <strong>앱 확장 고려</strong>
          <span>작은 화면에서도 CTA, 카드, 입력 흐름이 한 줄로 자연스럽게 접힙니다.</span>
        </article>
      </section>

      {authOpen && (
        <div className="login-modal-backdrop" role="presentation">
          <section
            aria-label={authMode === 'login' ? '로그인' : '회원가입'}
            aria-modal="true"
            className="login-modal"
            role="dialog"
          >
            <button className="modal-close-button" type="button" onClick={() => setAuthOpen(false)}>
              닫기
            </button>
            <strong className="login-wordmark">Repick</strong>
            <h2>{authMode === 'login' ? '로그인' : '회원가입'}</h2>
            <p>
              {authMode === 'login'
                ? '가입한 이메일과 비밀번호로 운동 기록을 이어갑니다.'
                : '이메일은 추후 인증에 사용할 예정입니다.'}
            </p>

            <div className="auth-mode-tabs" aria-label="인증 방식 선택">
              <button className={authMode === 'login' ? 'active' : ''} type="button" onClick={() => setAuthMode('login')}>
                로그인
              </button>
              <button className={authMode === 'register' ? 'active' : ''} type="button" onClick={() => setAuthMode('register')}>
                회원가입
              </button>
            </div>

            <form className="login-id-form" onSubmit={submitAuth}>
              <label>
                <span>아이디 (이메일)</span>
                <input
                  autoFocus
                  inputMode="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                <span>비밀번호</span>
                <input
                  minLength={8}
                  placeholder="8자 이상"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {authMode === 'register' && (
                <>
                  <label>
                    <span>닉네임</span>
                    <input
                      maxLength={20}
                      minLength={2}
                      placeholder="예: 운동하는사람"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                    />
                  </label>
                  <div className="register-field-grid">
                    <label>
                      <span>운동목적</span>
                      <select value={workoutGoal} onChange={(event) => setWorkoutGoal(event.target.value as WorkoutGoal)}>
                        {workoutGoalOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>성별</span>
                      <select value={gender} onChange={(event) => setGender(event.target.value as Gender)}>
                        {genderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>연령대</span>
                      <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value as AgeGroup)}>
                        {ageGroupOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}

              {authError && <p className="error-message">{authError}</p>}
              <button className="login-button primary-login" type="submit" disabled={submitting}>
                {submitting ? '처리 중' : authMode === 'login' ? '로그인' : '회원가입'}
              </button>
            </form>
            <span className="mock-login-note">
              {authMode === 'login'
                ? '비밀번호는 서버에서 해시로 검증됩니다.'
                : '소셜 로그인과 이메일 인증은 추후 연결 예정입니다.'}
            </span>
          </section>
        </div>
      )}
    </main>
  );
}
