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
com.healthtracker.api.market   한국투자증권 KIS 미국주식 현재가 조회 프록시
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

프론트엔드는 현재 동작하는 프로토타입이며, 운동 세션/기록은 백엔드 API와 연결되어 있다.
백엔드 호출 실패 시에는 사용자가 기록 흐름을 계속 진행할 수 있도록 로컬 fallback을 유지한다.

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
- 1RM 계산기
- 내 활동/캘린더
- 운동 완료 요약

라우팅:

- React Router 의존성은 아직 추가하지 않았고, `frontend/src/App.tsx`에서 History API로 직접 처리한다.
- 주요 URL은 `/`, `/planner`, `/record`, `/one-rm`, `/activity`, `/summary/:sessionId`이다.
- 하단 탭과 주요 화면 이동은 `navigateToView(...)`를 통해 URL과 화면 상태를 함께 갱신한다.
- 브라우저 뒤로가기는 `popstate` 이벤트로 `activeView`와 `summarySessionId`를 복구한다.
- Vercel 배포 시 새로고침 대응은 `vercel.json`의 SPA rewrite로 처리한다.

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
- 운동 기록 삭제는 `DELETE /api/workout-sessions/{sessionId}/records/{recordId}`이다.
- 운동 세션 삭제는 `DELETE /api/workout-sessions/{sessionId}`이다.

운동 기록 UX:

- 운동 추가 모달에는 최근 사용 기구와 즐겨찾기 기구를 빠르게 선택하는 UI가 있다.
- 즐겨찾기 기구는 아직 백엔드 저장이 아니라 사용자별 localStorage에 저장한다.
- 같은 기구를 다시 선택하면 현재 로드된 운동 세션 이력을 기준으로 이전 세트가 입력값에 자동 반영된다.
- 세트 입력 행에는 이전 세트 기록 힌트가 표시된다.
- 기구 선택 화면에서 즐겨찾기 별표와 상태 점이 겹치던 문제는 상태 점을 제거해서 해결했다.
- 기구 세트 입력 화면의 닫기 동작은 모달 종료가 아니라 기구 선택 목록으로 돌아가도록 수정했다.
- 운동 종료 버튼은 바로 종료하지 않고 `운동을 종료하시겠습니까?` 확인 팝업을 먼저 띄운다.

운동 완료 요약:

- 운동 종료 후 `/summary/:sessionId` 화면에서 완료 요약을 보여준다.
- 요약 화면은 Repick 색상에 맞춰 흰색/파란색 기반의 공유 카드 형태로 구성했다.
- 요약에는 운동 수, 세트 수, 반복 수, 총 볼륨, 운동 시간, kg/min 강도, 운동별 세트 정보가 표시된다.
- 운동별 대표 이미지는 `getExerciseAssetUrl(name)` 매핑으로 `frontend/public/exercises/` 에셋을 사용한다.
- 공유 버튼은 Canvas로 1080x1920 PNG 이미지를 생성한다.
- Web Share API를 지원하는 환경에서는 이미지 공유를 시도하고, 미지원 환경에서는 PNG 다운로드로 fallback 한다.

## 주식 현재가 기능

TradingView 위젯은 제거했고, 한국투자증권 KIS REST API 기반 현재가 카드로 대체했다.

백엔드 구조:

- `backend/src/main/java/com/healthtracker/api/market/api/MarketQuoteController.java`
- `backend/src/main/java/com/healthtracker/api/market/api/MarketQuoteDtos.java`
- `backend/src/main/java/com/healthtracker/api/market/domain/MarketWatchlist.java`
- `backend/src/main/java/com/healthtracker/api/market/repository/MarketWatchlistRepository.java`
- `backend/src/main/java/com/healthtracker/api/market/service/MarketQuoteService.java`
- `backend/src/main/java/com/healthtracker/api/market/service/KisAccessTokenProvider.java`
- `backend/src/main/java/com/healthtracker/api/market/service/MarketWatchlistService.java`
- `backend/src/main/java/com/healthtracker/api/market/config/KisProperties.java`

프론트 구조:

- `frontend/src/components/MarketQuotePanel.tsx`
- `frontend/src/components/TradingViewChart.tsx`는 삭제됨.

현재 API:

```text
GET /api/market/us-stocks/{symbol}
GET /api/market/watchlist
PUT /api/market/watchlist
GET /api/market/watchlist/quotes
```

관심 종목:

- 사용자별 관심 티커는 `market_watchlists` 컬렉션에 저장한다.
- 기본 관심 티커는 `INTC, AMD, ARM, MU, SNDK`이다.
- 사용자는 프론트에서 직접 티커를 추가/삭제할 수 있고 최대 5개까지 저장한다.
- 티커 입력은 대문자로 정규화하고 `NASDAQ:`/`NAS:` prefix는 제거한다.
- 관심 종목 목록 변경 후에도 삭제하지 않은 다른 종목의 기존 조회값이 초기화되지 않도록 프론트에서 기존 quote map을 보존한다.

동작:

- KIS OAuth token은 DB나 파일이 아니라 Spring Boot 서버 메모리에만 캐싱한다.
- `KisAccessTokenProvider`의 `cachedAccessToken` 필드에 저장한다.
- 토큰이 없거나 만료 5분 전이면 `/oauth2/tokenP`로 재발급한다.
- 서버 재시작/Render sleep 이후에는 다음 조회 때 새로 발급한다.
- KIS 현재가 응답 중 `output.last` 값을 현재가로 사용하고, `output.base`를 전일종가로 내려준다.
- 프론트는 `last`와 `base`를 기준으로 등락률을 계산한다.
- 현재가는 `$` 단위와 소수점 둘째 자리까지 표시한다.
- 현재가 색상은 검은색으로 유지하고, 등락률만 상승 빨강/하락 파랑/보합 회색으로 표시한다.
- 거래량 문구는 `거래량(주)`이며 천 단위 콤마를 적용한다.
- 프론트는 관심 종목 현재가를 10초 간격으로 갱신한다.
- 개별 종목 조회 실패 시 전체 목록을 비우지 않고, 성공한 종목과 이전 조회값을 최대한 유지한다.
- 주식 안내 영역에는 조회 시각과 함께 실제 사용한 `EXCD` 값을 작게 표시한다.

KIS EXCD 처리:

- 미국 주식 조회는 현재 미국 주식용 API에 `EXCD`를 넘긴다.
- 한국시간 기준 데이장 시작부터 정규장 종료까지는 `NAS`를 사용한다.
- 현재 로직은 미국 DST 여부를 고려해 한국시간 기준 `17:00~다음날 05:00`에는 `NAS`, 그 외에는 `BAQ`를 사용한다.
- 미국 표준시 기간에는 한국시간 기준 `18:00~다음날 06:00`을 `NAS` 구간으로 본다.
- 위 조건은 `backend/src/main/java/com/healthtracker/api/market/service/MarketQuoteService.java`의 `resolveNasdaqExchangeCode()`에서 관리한다.

필요 환경변수:

```bash
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_APP_KEY=...
KIS_APP_SECRET=...
KIS_PRICE_DETAIL_TR_ID=HHDFS76200200
```

주의:

- `KIS_APP_KEY`, `KIS_APP_SECRET`은 절대 GitHub에 커밋하지 않는다.
- 실제 값은 `backend/.env` 또는 Render Environment Variables에만 둔다.
- `backend/.env.example`에는 placeholder만 둔다.
- `application.yml`은 `optional:file:.env[.properties]`로 로컬 `.env`를 읽는다.
- 삼성전자/하이닉스는 아직 빠져 있다. 국내주식 API를 별도로 붙여야 한다.
- 다음 작업으로 KIS access token 캐시를 서버 메모리에서 MongoDB로 옮길 예정이다.
- DB 캐시 전환 시 `kis_access_tokens` 같은 컬렉션을 만들고, app key 기반 cache id, access token, expiresAt, updatedAt을 저장하는 방식이 적합하다.
- 여러 서버/로컬 환경에서 동시에 토큰을 발급받는 문제를 줄이려면 `KisAccessTokenProvider`가 먼저 DB 캐시를 조회하고, 없거나 만료 임박일 때만 `/oauth2/tokenP`를 호출하게 바꾼다.

## 운동 이미지 에셋

기구별 이미지 에셋은 `frontend/public/exercises/`에 저장한다.

현재 해부학 스타일 대표 에셋을 생성해 운동명 기반으로 매핑했다.

대표 파일 예:

```text
bench-press-anatomy.png
incline-press-anatomy.png
chest-fly-anatomy.png
lat-pulldown-anatomy.png
seated-row-anatomy.png
leg-press-anatomy.png
squat-anatomy.png
leg-extension-anatomy.png
leg-curl-anatomy.png
deadlift-anatomy.png
shoulder-press-anatomy.png
lateral-raise-anatomy.png
rear-delt-fly-anatomy.png
triceps-pushdown-anatomy.png
biceps-curl-anatomy.png
cable-crunch-anatomy.png
plank-anatomy.png
```

매핑 함수는 `frontend/src/App.tsx`의 `getExerciseAssetUrl(name)`이다.
새 운동 이미지를 추가하면 이 함수의 keyword rule도 같이 갱신한다.

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

- `README.md`에는 예전 OAuth/JPA 기반 설명이 일부 남아 있을 수 있으므로 이후 갱신이 필요하다.
- 운동 기록은 백엔드 세션 API와 연결되었고, 백엔드 호출 실패 시 로컬 fallback으로 동작한다.
- 운동 카탈로그 API는 백엔드와 프론트 연결이 완료되었고, 실패 시 프론트 목업 fallback을 사용한다.
- 프론트의 운동 시작, 운동 추가, 운동 종료 흐름은 운동 세션 API와 연결되었다.
- 백엔드 호출이 실패하면 운동 화면은 로컬 세션 fallback으로 계속 동작한다.
- 즐겨찾기 운동은 아직 백엔드 저장이 아니라 localStorage 기반이다.
- 주식 관심 종목은 백엔드 MongoDB에 저장하지만, KIS access token은 아직 서버 메모리 캐시다.
- 프론트 화면 라우팅은 History API 직접 구현이므로, 화면 추가 시 `parseAppRoute()`, `getAppRoutePath()`, `navigateToView()`를 함께 확인해야 한다.

## 다음 세션 인수인계 메모

이번 세션에서 완료한 주요 작업:

- 최근 사용 기구 / 즐겨찾기 / 이전 세트 자동 불러오기 / 세트별 이전 기록 힌트를 프론트에 적용했다.
- 운동 선택 카드의 즐겨찾기 별표와 status-dot 겹침을 제거했다.
- 기구 세트 입력 화면에서 닫기 버튼을 누르면 기구 선택 화면으로 돌아가도록 수정했다.
- 주식 현재가 UI를 큰 카드형에서 한 줄 리스트형으로 간소화했다.
- 주식 현재가는 `$`와 소수점 둘째 자리로 표시하고, 등락률은 `base` 대비 계산해 색상을 적용했다.
- 사용자가 최대 5개 티커를 입력하고 MongoDB watchlist로 저장/관리하도록 구현했다.
- 관심 종목 추가/삭제 후 다른 종목 현재가가 초기화되거나 호출 대상에서 빠지는 문제를 보완했다.
- KIS `EXCD`를 한국시간 기준 데이장/정규장에는 `NAS`, 그 외에는 `BAQ`로 선택하도록 수정했다.
- 주식 목록에 조회 시각과 사용한 `EXCD`를 작게 표시했다.
- 운동 완료 요약 화면을 Repick 흰색/파란색 스타일의 공유 카드로 개편했다.
- 공유 버튼으로 1080x1920 PNG 이미지를 생성하고 Web Share API 또는 다운로드 fallback을 사용하도록 했다.
- 운동 종료 버튼에 확인 팝업을 추가했다.
- 화면 이동에 URL 라우팅을 추가하고 뒤로가기를 지원하도록 했다.

다음 창에서 바로 이어서 할 만한 작업:

1. KIS access token 캐시를 서버 메모리에서 MongoDB로 옮긴다.
2. `KisAccessTokenProvider`에 DB 캐시 조회/저장 로직을 추가한다.
3. `kis_access_tokens` 컬렉션용 `@Document`와 `MongoRepository`를 만든다.
4. 토큰 만료 5분 전에는 기존처럼 재발급하되, 여러 실행 환경이 같은 DB 캐시를 공유하게 한다.
5. 구현 후 `cd backend && ./gradlew test`를 실행한다.

검증 상황:

- 최근 프론트 변경 후 `npm --prefix frontend run build` 성공.
- 최근 백엔드 주식 기능 변경 후 `cd backend && ./gradlew test` 성공.
- AGENTS.md 정리 자체는 문서 변경이라 별도 빌드/테스트를 실행하지 않았다.
- 소셜 로그인과 이메일 인증은 추후 기능이다.
