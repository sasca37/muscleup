# Repick

Spring Boot + React 기반 헬스 기록 MVP입니다.

## MVP 범위

- 이메일/비밀번호 기반 회원가입과 로그인
- 부위별 운동 기구 목록
- 기구별 운동 기록 작성
- 기구 선택 시 이전 기록 조회
- 날짜별 운동 세션 조회
- 1RM 계산기와 주간 루틴 초안
- KIS REST API 기반 미국주식 현재가 관심 목록

커뮤니티 기능은 2차 범위로 분리했습니다.

## 구조

```text
backend/   Spring Boot REST API
frontend/  React + TypeScript + Vite
```

## 실행 준비

백엔드는 Gradle Wrapper를 포함합니다. 로컬에 Gradle을 따로 설치하지 않아도 됩니다.

```bash
cd backend
./gradlew bootRun
```

프론트엔드는 의존성 설치 후 실행합니다.

```bash
cd frontend
npm install
npm run dev
```

기본 프론트 API 주소는 `http://localhost:8080`입니다. 백엔드는 기본적으로 `MONGODB_URI`를 사용하며, 값이 없으면 `mongodb://localhost:27017/repick`에 연결합니다.

프론트 환경 예시는 아래처럼 나눴습니다.

```text
frontend/.env.localdev.example     로컬 실행용
frontend/.env.devdeploy.example    개발 배포용
frontend/.env.production.example   운영 배포용
```

로컬에서는 필요하면 `frontend/.env.localdev.example`을 `frontend/.env.localdev`로 복사해서 사용하세요.

```bash
cd frontend
npm run dev:local
```

개발 배포 URL은 `https://muscleup-psi.vercel.app`로 잡아두었습니다.

Vite에서 `local`은 `.env.local` postfix와 충돌하는 예약 이름이라 mode 이름은 `localdev`를 사용합니다.

## Vercel 배포

프론트엔드는 Vercel에 바로 배포할 수 있도록 루트 `vercel.json`을 포함합니다.

Vercel에서 GitHub 저장소를 연결할 때 루트 디렉터리는 저장소 루트 그대로 두면 됩니다.

- Framework Preset: `Vite`
- Install Command: `npm --prefix frontend install`
- Build Command: `npm --prefix frontend run build`
- Output Directory: `frontend/dist`

홈 화면과 UI 확인만 할 때는 별도 환경변수 없이 배포해도 됩니다.

로그인과 운동 기록 API까지 폰에서 실제로 쓰려면 Spring 백엔드를 먼저 외부 URL로 배포하고, Vercel 환경변수에 아래 값을 설정해야 합니다.

```bash
VITE_API_BASE_URL=https://your-backend.example.com
VITE_APP_BASE_URL=https://muscleup-psi.vercel.app
```

Spring 백엔드는 Vercel보다 Render, Fly.io, Railway, AWS, GCP 같은 서버 배포 환경이 더 적합합니다.

백엔드도 프론트 URL을 profile로 분리했습니다.

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
./gradlew bootRun --args='--spring.profiles.active=dev'
```

- `local`: `http://localhost:5173`
- `dev`: `https://muscleup-psi.vercel.app`

## 인증 설정

현재 인증은 이메일과 비밀번호 기반입니다.

- 회원가입: `POST /api/users/register`
- 로그인: `POST /api/users/login`
- 비밀번호는 BCrypt 해시로 저장합니다.
- 운동 세션 API는 임시로 로그인 유저의 `id`를 `X-User-Id` 헤더에 담아 호출합니다.

OAuth와 소셜 로그인은 현재 MVP 범위에서 제외했고, 추후 명시적으로 다시 붙일 예정입니다.

## KIS 현재가 설정

미국주식 현재가 기능을 실제로 사용하려면 백엔드 환경변수에 한국투자증권 KIS 키를 설정해야 합니다.

```bash
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_APP_KEY=...
KIS_APP_SECRET=...
KIS_PRICE_DETAIL_TR_ID=HHDFS76200200
```

로컬 예시는 [backend/.env.example](backend/.env.example)에 있습니다. 실제 키는 Git에 커밋하지 마세요.
