# Repick 작업 지시서

## 제품 방향

Repick은 헬스 운동 기록 웹앱이다. 현재 목표는 포트폴리오에 보여줄 수 있을 정도로 깔끔한 MVP를 만들고, 이후 모바일 앱으로 확장 가능한 구조를 준비하는 것이다.

핵심 기능 방향:

- 사용자는 운동 기구/종목별로 운동 기록을 남길 수 있다.
- 같은 운동을 다시 선택하면 이전 기록을 확인할 수 있어야 한다.
- 사용자는 운동 시작/종료를 할 수 있고, 총 운동 시간을 볼 수 있어야 한다.
- 사용자는 내 활동 화면에서 운동 이력과 운동한 날짜를 캘린더 형태로 볼 수 있어야 한다.
- 사용자는 1RM 예상값을 계산할 수 있어야 한다.
- 사용자는 프로필/분할 방식 설정을 기반으로 주간 루틴 초안을 만들 수 있어야 한다.
- 커뮤니티 기능은 2차 범위로 미룬다.

## 현재 기술 스택

프론트엔드:

- React
- TypeScript
- Vite
- `frontend/src/styles.css` 기반의 plain CSS
- Vercel 배포

백엔드:

- Spring Boot
- Gradle Wrapper
- MongoDB Atlas
- Spring Data MongoDB

데이터베이스:

- MongoDB를 기본 데이터베이스로 사용한다.
- 명시적인 요청이 없으면 JPA/RDB 구조를 다시 도입하지 않는다.
- 현재 기본 DB 이름은 `repick`이다.
- MongoDB 연결은 `MONGODB_URI` 환경변수로 관리한다.

## 저장소 구조

```text
backend/   Spring Boot API
frontend/  React + Vite 앱
```

주요 백엔드 패키지:

```text
com.healthtracker.api.common   공통 에러 응답과 예외 처리
com.healthtracker.api.config   Web/CORS 설정
com.healthtracker.api.exercise MongoDB 기반 운동 카탈로그 도메인
com.healthtracker.api.mongo    임시 MongoDB 연결 테스트 API
com.healthtracker.api.user     MongoDB 기반 유저 로그인 도메인
com.healthtracker.api.workout  MongoDB 기반 운동 세션/기록 도메인
```

주요 프론트엔드 파일:

```text
frontend/src/App.tsx
frontend/src/components/LoginGate.tsx
frontend/src/api/client.ts
frontend/src/types/domain.ts
frontend/src/data/mockMachines.ts
frontend/src/styles.css
```

## 백엔드 개발 기준

백엔드는 MongoDB 우선 구조로 개발한다.

사용할 것:

- `@Document`
- `org.springframework.data.annotation.Id`
- `MongoRepository`
- 비즈니스 로직은 Service 클래스로 분리
- API 요청/응답은 DTO record로 명확히 정의
- 공통 에러는 `GlobalExceptionHandler`에서 처리

피할 것:

- `@Entity`
- `jakarta.persistence.*`
- `JpaRepository`
- H2/PostgreSQL 설정
- OAuth/Spring Security 로그인 흐름

OAuth나 소셜 로그인은 사용자가 명시적으로 다시 요청하기 전까지 구현하지 않는다.

현재 인증 방식:

- 프론트엔드는 회원가입과 로그인을 별도 버튼/폼으로 제공한다.
- 회원가입 엔드포인트는 `POST /api/users/register`이다.
- 백엔드 엔드포인트는 `POST /api/users/login`이다.
- 회원가입 입력값은 이메일, 비밀번호, 닉네임, 운동목적, 성별, 연령대다.
- 이메일은 로그인 아이디로 사용하며 추후 이메일 인증을 붙일 예정이다.
- 비밀번호는 평문 저장하지 않고 BCrypt 해시로 저장한다.
- 로그인 시 이메일과 비밀번호를 검증하고 성공하면 `lastLoginAt`을 갱신한다.
- 운동목적은 다이어트, 근비대, 건강 중 하나다.
- 성별은 남, 여 중 하나다.
- 연령대는 10대부터 90대까지 선택한다.
- 소셜 로그인은 추후 붙일 수 있지만 현재는 사용하지 않는다.

현재 유저 컬렉션:

```text
users
```

현재 테스트 컬렉션:

```text
mongo_connection_tests
```

`mongo-test` API는 사용자가 삭제를 요청하기 전까지 유지한다.

## 프론트엔드 개발 기준

프론트엔드는 현재 동작하는 프로토타입이며, 운동 기록은 아직 대부분 로컬 UI 상태로 관리한다.

로그인:

- public 화면에는 로그인 버튼과 회원가입 버튼이 별도로 있다.
- 로그인 모달은 이메일과 비밀번호를 입력받는다.
- 회원가입 모달은 이메일, 비밀번호, 닉네임, 운동목적, 성별, 연령대를 입력받는다.
- 로그인은 `api.login({ email, password })`를 호출한다.
- 회원가입은 `api.register(payload)`를 호출한다.
- 로그인 성공 시 반환된 유저 정보를 localStorage에 저장한다.
- 로그아웃 시 localStorage의 유저 세션을 지우고 public/login 화면으로 돌아간다.
- 운동 세션 API는 임시로 로그인 유저의 `id`를 `X-User-Id` 헤더에 담아 호출한다.

운동 UI:

- 모바일 친화성을 우선한다.
- 모바일에서는 하단 탭 스타일 내비게이션을 선호한다.
- 버튼과 입력 요소는 손가락으로 누르기 편한 크기를 유지한다.
- 데스크톱 전용으로만 편한 복잡한 레이아웃은 피한다.
- 이후 모바일 앱으로 확장될 수 있는 앱 같은 사용성을 유지한다.

현재 주요 화면:

- 홈 대시보드
- 루틴 설계
- 운동 기록
- 히스토리
- 1RM 계산기
- 내 활동/캘린더

운동 데이터:

- `frontend/src/data/mockMachines.ts`에 운동/기구 목업 데이터가 있다.
- 현재 각 부위별 샘플 운동이 10개씩 들어 있다.
- 백엔드에는 `exercises` 컬렉션과 `GET /api/exercises` 운동 카탈로그 API가 있다.
- `GET /api/exercises?muscleGroup=CHEST`처럼 부위별 조회가 가능하다.
- 앱 시작 시 `exercises` 컬렉션이 비어 있으면 기본 운동 60개를 자동 시드한다.
- 프론트는 로그인 이후 `GET /api/exercises`를 호출해 운동 카탈로그를 가져온다.
- 백엔드 호출이 실패하면 기존 `mockMachines` 데이터로 fallback 한다.

주의:

- 예전에 존재했던 백엔드 운동 기록 API는 MongoDB 전환 과정에서 제거되었다.
- 프론트에서 운동 기록 저장 API를 다시 연결할 때는 기존 JPA 기반 엔드포인트로 되돌리지 말고 MongoDB 문서 구조로 새로 설계한다.

운동 세션 API:

- 운동 세션 컬렉션은 `workout_sessions`이다.
- 한 운동 세션 문서 안에 운동 기록 `records`와 세트 `sets`를 embedded로 저장한다.
- 기록 저장 시 운동 카탈로그의 이름, 부위, movementPattern을 스냅샷으로 복사한다.
- 현재 인증은 임시로 `X-User-Id` 요청 헤더를 사용한다.
- 이후 JWT나 세션 인증을 붙이면 `X-User-Id` 처리부를 교체한다.
- 운동 시작은 `POST /api/workout-sessions/start`이다.
- 오늘 세션 조회는 `GET /api/workout-sessions/today`이다.
- 전체 세션 조회는 `GET /api/workout-sessions`이다.
- 운동 기록 추가는 `POST /api/workout-sessions/{sessionId}/records`이다.
- 운동 종료는 `PATCH /api/workout-sessions/{sessionId}/finish`이다.
- 기구별 이전 기록 조회는 `GET /api/exercises/{catalogId}/history`이다.

## 디자인 기준

- Repick은 깔끔하고 실용적인 앱처럼 느껴져야 한다.
- 데스크톱 장식보다 모바일 사용성을 우선한다.
- 로그인 이후 화면은 랜딩페이지처럼 만들지 않는다.
- 한국어 UI 문구는 짧고 명확하게 쓴다.
- 카드 radius는 과하게 둥글게 만들지 않는다.
- 아이콘이 필요하면 기존 `lucide-react`를 우선 사용한다.
- 사용자가 요청하지 않는 한 큰 UI 라이브러리를 추가하지 않는다.

## 실행 명령어

프론트엔드:

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
```

백엔드:

```bash
cd backend
./gradlew test
./gradlew bootRun
```

MongoDB 로컬/기본값:

```bash
MONGODB_URI=mongodb://localhost:27017/repick
```

MongoDB Atlas 예시:

```bash
MONGODB_URI='mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/repick?retryWrites=true&w=majority'
```

## 배포 메모

프론트엔드:

- Vercel을 사용한다.
- 현재 개발용 프론트 URL은 `https://muscleup-psi.vercel.app`이다.

백엔드:

- 백엔드 배포 대상은 아직 확정하지 않았다.
- Render, Railway, Fly.io, AWS, GCP 등이 후보이다.
- Spring Boot 백엔드는 Vercel에 배포하기 적합하지 않다.

프론트엔드 환경변수:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_BASE_URL=http://localhost:5173
```

배포된 프론트에서 실제 백엔드를 호출하려면 `VITE_API_BASE_URL`을 배포된 백엔드 URL로 설정해야 한다.

## Git 작업 기준

- 현재는 `main` 브랜치를 직접 사용한다.
- 커밋 메시지는 간단한 Conventional Commit 스타일을 따른다.
  - 예: `feat: mongodb init`
  - 예: `feat: 화면 초안 설계`
  - 예: `fix: 로그인 오류 수정`
- 커밋 전 관련 검증을 실행한다.
  - 프론트 변경: `npm --prefix frontend run build`
  - 백엔드 변경: `cd backend && ./gradlew test`

## 현재 주의사항

- `README.md`에는 예전 OAuth/JPA 기반 설명이 일부 남아 있으므로 이후 갱신이 필요하다.
- 운동 기록은 백엔드 세션 API와 연결되었고, 백엔드 호출 실패 시 로컬 fallback으로 동작한다.
- 운동 카탈로그 API는 백엔드와 프론트 연결이 완료되었고, 실패 시 프론트 목업 fallback을 사용한다.
- 프론트의 운동 시작, 운동 추가, 운동 종료 흐름은 운동 세션 API와 연결되었다.
- 백엔드 호출이 실패하면 운동 화면은 로컬 세션 fallback으로 계속 동작한다.
- 소셜 로그인과 이메일 인증은 추후 기능이다.
