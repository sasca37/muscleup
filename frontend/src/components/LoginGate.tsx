import { Activity, Dumbbell, LogIn, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../types/domain';

type LoginGateProps = {
  onLoginSuccess: (user: User) => void;
};

export function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  function completeMockLogin(provider: 'google' | 'kakao') {
    onLoginSuccess({
      id: 1,
      email: 'demo@repick.app',
      displayName: provider === 'google' ? 'Google Demo' : 'Kakao Demo',
      provider,
    });
    setLoginOpen(false);
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
        <button
          aria-expanded={loginOpen}
          className="public-login-button"
          type="button"
          onClick={() => setLoginOpen((current) => !current)}
        >
          <LogIn size={17} />
          로그인
        </button>
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
            <button className="primary-button" type="button" onClick={() => setLoginOpen(true)}>
              <LogIn size={16} />
              로그인하고 기록하기
            </button>
            <a className="secondary-link" href="#features">
              둘러보기
            </a>
          </div>

          {loginOpen && (
            <div className="login-modal-backdrop" role="presentation" onClick={() => setLoginOpen(false)}>
              <section
                aria-label="로그인 선택"
                aria-modal="true"
                className="login-modal"
                role="dialog"
                onClick={(event) => event.stopPropagation()}
              >
                <button className="modal-close-button" type="button" onClick={() => setLoginOpen(false)}>
                  닫기
                </button>
                <strong className="login-wordmark">Repick</strong>
                <h2>소셜 계정으로 시작하기</h2>
                <p>지금은 프론트 화면 확인용이라 버튼을 누르면 바로 로그인 성공 상태로 이동합니다.</p>
                <div className="login-actions">
                  <button className="login-button google" type="button" onClick={() => completeMockLogin('google')}>
                    Google로 시작
                  </button>
                  <button className="login-button kakao" type="button" onClick={() => completeMockLogin('kakao')}>
                    Kakao로 시작
                  </button>
                </div>
                <span className="mock-login-note">백엔드 OAuth 연결 전까지 사용하는 목업 로그인입니다.</span>
              </section>
            </div>
          )}
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
    </main>
  );
}
