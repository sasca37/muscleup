import { Activity, Dumbbell, LogIn, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';

export function LoginGate() {
  const [loginOpen, setLoginOpen] = useState(false);

  function markLoginRequested() {
    window.localStorage.setItem('muscle-log-login-requested', 'true');
  }

  return (
    <main className="login-shell">
      <header className="public-topbar">
        <div className="brand-wordmark">MUSCLE LOG</div>
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
            Muscle Log는 운동 기구별 무게, 횟수, 이전 기록을 빠르게 확인하는 헬스 기록 서비스입니다.
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
            <section className="login-panel" aria-label="로그인 선택">
              <strong className="login-wordmark">MUSCLE LOG</strong>
              <p>소셜 계정으로 시작하면 기구별 운동 기록을 저장할 수 있습니다.</p>
              <div className="login-actions">
                <a className="login-button google" href={api.loginUrl('google')} onClick={markLoginRequested}>
                  Google로 시작
                </a>
                <a className="login-button kakao" href={api.loginUrl('kakao')} onClick={markLoginRequested}>
                  Kakao로 시작
                </a>
              </div>
            </section>
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
