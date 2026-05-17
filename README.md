# Muscle Log

Spring Boot + React 기반 헬스 기록 MVP입니다.

## MVP 범위

- 소셜 로그인 기반 사용자 식별
- 부위별 운동 기구 목록
- 기구별 운동 기록 작성
- 기구 선택 시 이전 기록 조회
- 날짜별 운동 세션 조회

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

기본 프론트 API 주소는 `http://localhost:8080`입니다.

프론트 환경 예시는 아래처럼 나눴습니다.

```text
frontend/.env.local.example        로컬 실행용
frontend/.env.development.example  개발 배포용
frontend/.env.production.example   운영 배포용
```

로컬에서는 필요하면 `frontend/.env.local.example`을 `frontend/.env.local`로 복사해서 사용하세요.

```bash
cd frontend
npm run dev:local
```

개발 배포 URL은 `https://muscleup-psi.vercel.app`로 잡아두었습니다.

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

초기 개발 편의를 위해 백엔드는 기본값으로 dev 사용자 모드를 사용합니다. 이 상태에서는 OAuth 키 없이도 API와 프론트 화면을 바로 확인할 수 있습니다.

소셜 로그인으로 전환하려면 `DEV_AUTH_ENABLED=false`를 설정하고 OAuth 클라이언트 값을 넣습니다.

```bash
export DEV_AUTH_ENABLED=false
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
export KAKAO_CLIENT_ID=...
export KAKAO_CLIENT_SECRET=...
```

첫 개발 단계에서는 Google 또는 Kakao 중 하나만 설정해도 됩니다.

OAuth 등록 예시는 [application-oauth.example.yml](backend/src/main/resources/application-oauth.example.yml)에 있습니다.
