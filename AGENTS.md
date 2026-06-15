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
- 사용자는 운동 완료 보상으로 앱 내 재화인 `닭가슴살`을 얻고, 이를 사용해 기본 아바타를 꾸밀 수 있어야 한다.
- 커뮤니티 기능은 2차 범위로 미룬다.

## 캐릭터/재화 방향

Repick은 단순 운동 기록 앱에서 `운동 기록으로 아바타를 꾸미는 헬스 기록 앱` 방향으로 확장한다.

핵심 컨셉:

- 캐릭터는 자동 성장으로 외형이 바뀌는 펫이 아니라, 사용자가 직접 꾸미는 2D SD 아바타다.
- 기본 캐릭터는 남자/여자 베이스 중 하나를 선택하는 구조로 시작한다.
- 캐릭터 스타일은 귀엽고 캐주얼한 오리지널 2D SD 아바타로 만든다.
- 특정 게임 캐릭터, 의상, 비율, UI를 직접 모방하지 않는다.
- 레벨은 유지하되 외형 자동 변화가 아니라 상점/옷장 기능 잠금 해제와 보상 기준으로 사용한다.
- 운동 완료 시 앱 내 재화인 `닭가슴살`을 지급한다.
- 닭가슴살은 운동 완료, 세트 수, 운동 시간, 주간 미션, 1RM 갱신 같은 실제 기록 기반 보상으로 얻는다.
- 현재 MVP에서는 닭가슴살 보유량을 프론트에서 계산한다.
- 현재 MVP 보유량 공식은 `완료 세션 수 * 5 + 저장 세트 수 * 2 + 운동한 날짜 수 * 8 + 계정별 지급분 + 무료 지급분 - 사용분`이다.
- 현재 MVP에서는 `sasca37@naver.com` 계정에 닭가슴살 100,000개를 지급한다.
- 현재 MVP에서는 상점 화면에서 `무료 닭가슴살 받기` 버튼을 누를 때마다 무료 지급분 1,000개가 추가된다.
- 무료 지급분, 구매 아이템, 장착 아이템, 사용한 닭가슴살은 사용자별 localStorage에 저장한다.
- 추후 앱 출시 시 닭가슴살은 인앱결제로도 구매할 수 있게 설계할 수 있다.
- 닭가슴살 유료 판매는 iOS App Store와 Google Play의 인앱결제 정책을 따르는 것을 전제로 한다.
- 초반에는 랜덤박스/뽑기보다 확정 구매형 상점을 우선한다.
- 유료 재화가 있더라도 운동 기록 없이 모든 콘텐츠를 바로 열 수 있게 만들지 않는다. 일부 아이템은 레벨이나 운동 기록 조건을 요구한다.

닭가슴살 보상 초안:

- 운동 완료 기본 보상: 5개
- 30분 이상 운동: 추가 3개
- 10세트 이상 기록: 추가 3개
- 새 운동 종목 기록: 추가 2개
- 주 3회 운동 달성: 추가 15개
- 1RM 갱신: 추가 10개
- 연속 운동 3일: 추가 10개
- 허위 기록과 재화 인플레이션을 줄이기 위해 일일 획득 상한을 둔다.

꾸미기 카테고리 초안:

- 헤어
- 상의
- 하의
- 신발
- 악세사리
- 손에 드는 운동 소품
- 캐릭터 배경
- 운동 완료 이펙트
- 프로필 카드 장식

상점/옷장 기준:

- 상점은 `/shop` 화면이며, 닭가슴살로 아직 보유하지 않은 아이템을 구매하는 화면이다.
- 옷장은 구매했거나 보상으로 얻은 아이템을 장착하는 화면이다.
- 아이템은 부위별로 하나씩 장착하는 구조를 기본으로 한다.
- 기본 아이템은 무료 또는 매우 낮은 가격으로 제공한다.
- 시즌 한정/고급 아이템은 닭가슴살을 많이 요구하되 무과금 운동 기록으로도 획득 가능해야 한다.
- 확률형 아이템을 도입할 경우 한국 확률형 아이템 정보공개와 앱마켓 정책을 별도로 검토한다.
- 현재 MVP 상점 아이템은 캐릭터 잠금해제, 옷, 악세사리, 펫으로 구성한다.
- 캐릭터 2, 3번은 기본 선택 가능 캐릭터이고, 캐릭터 1, 4번은 닭가슴살로 잠금해제하는 방향이다.
- 펫은 구매 후 장착하면 홈 화면 캐릭터 옆에 표시한다.
- 현재 펫 에셋은 `frontend/public/companions/cat-brown-1.png`, `cat-brown-2.png`, `cat-brown-3.png`이다.
- 펫 PNG는 사용자가 제공한 상업 사용 가능 에셋이며, 흰 배경은 로컬에서 투명 처리했다.
- 현재 캐릭터 에셋은 `frontend/public/avatars/`에 성별별 4개씩 저장되어 있다.
- 현재 상점/인벤토리 상태 key는 `repick-shop-state:{user.id}`이다.
- 현재 캐릭터 선택 상태 key는 `repick-avatar-selection:{user.id}`이다.

## 현재 기술 스택

프론트엔드:

- React
- TypeScript
- Vite
- `frontend/src/styles.css` 기반의 plain CSS
- Vercel 배포

모바일:

- Flutter
- Dart
- `mobile/` 독립 앱 프로젝트
- iOS/Android/Web 타깃을 생성했지만 MVP 개발 우선순위는 iOS와 Flutter Web 확인이다.
- Flutter 앱은 기존 React 웹을 그대로 복사하지 않고, 웹의 API 계약/도메인 로직/에셋을 참고해 네이티브 앱 구조로 재구현한다.

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
mobile/    Flutter 모바일 앱
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

주요 모바일 파일:

```text
mobile/lib/main.dart
mobile/lib/src/app/repick_app.dart
mobile/lib/src/app/app_theme.dart
mobile/lib/src/core/api_client.dart
mobile/lib/src/core/local_store.dart
mobile/lib/src/data/repick_catalog.dart
mobile/lib/src/shared/models.dart
mobile/assets/avatars/
mobile/assets/companions/
mobile/assets/exercises/
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
- public 화면은 단순 로그인 화면이 아니라 `캐릭터를 키워보시겠어요?` 문구를 중심으로 캐릭터 육성/닭가슴살 보상/펫 상점을 홍보하는 배너형 화면이다.
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
- 로그인 이후 홈 화면은 기능 카드 나열보다 캐릭터/아바타 조회를 중심으로 구성한다.
- 홈에서는 레벨, 닭가슴살 보유량, 오늘 운동 보상, 주간 미션, 캐릭터 변경, 상점 진입을 우선 노출한다.
- 홈 화면 캐릭터 방에는 장착한 펫과 악세사리 소품을 함께 표시한다.
- 기존 운동 기록 화면의 파란색 톤과 통일되도록 public 화면, 홈 캐릭터 화면, 캐릭터 선택 모달, 상점 화면도 `#0a66d8` 중심의 블루 톤을 사용한다.

현재 주요 화면:

- 홈 캐릭터/아바타 화면
- 상점
- 루틴 설계
- 운동 기록
- 1RM 계산기
- 내 활동/캘린더
- 운동 완료 요약

라우팅:

- React Router 의존성은 아직 추가하지 않았고, `frontend/src/App.tsx`에서 History API로 직접 처리한다.
- 주요 URL은 `/`, `/shop`, `/planner`, `/record`, `/one-rm`, `/activity`, `/summary/:sessionId`이다.
- 하단 탭과 주요 화면 이동은 `navigateToView(...)`를 통해 URL과 화면 상태를 함께 갱신한다.
- 브라우저 뒤로가기는 `popstate` 이벤트로 `activeView`와 `summarySessionId`를 복구한다.
- Vercel 배포 시 새로고침 대응은 `vercel.json`의 SPA rewrite로 처리한다.
- 화면 추가 시 `ActiveView`, `parseAppRoute()`, `getAppRoutePath()`, `navigateToView()`를 함께 확인한다.

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
- 운동 기록 화면은 진행 중인 세션의 기록만 보여준다.
- 운동을 시작하지 않은 상태에서는 오늘 저장된 완료 기록을 운동 기록 화면 하단에 다시 노출하지 않는다.
- 기구 선택 화면에서 즐겨찾기 별표와 상태 점이 겹치던 문제는 상태 점을 제거해서 해결했다.
- 기구 세트 입력 화면의 닫기 동작은 모달 종료가 아니라 기구 선택 목록으로 돌아가도록 수정했다.
- 운동 종료 버튼은 바로 종료하지 않고 `운동을 종료하시겠습니까?` 확인 팝업을 먼저 띄운다.

운동 완료 요약:

- 운동 종료 후 `/summary/:sessionId` 화면에서 완료 요약을 보여준다.
- 요약 화면은 파스텔 헤더와 2열 운동 리스트 기반의 간결한 공유 카드 형태로 구성했다.
- 요약에는 운동 시간, 세트 수, 반복 수, 총 볼륨, 운동별 볼륨, 운동별 세트 정보가 표시된다.
- 운동별 대표 이미지는 `getExerciseAssetUrl(name)` 매핑으로 `frontend/public/exercises/` 에셋을 사용한다.
- 운동별 세트는 중량을 파란 원형 배지로, 반복 수를 배지 아래 텍스트로 보여주는 형태다.
- 공유 버튼은 Canvas로 PNG 이미지를 생성한다.
- 기본 공유 이미지는 1080x1080이며, 운동/세트가 많으면 전체 내용이 보이도록 세로 길이를 자동으로 늘린다.
- Web Share API를 지원하는 환경에서는 이미지 공유를 시도하고, 미지원 환경에서는 PNG 다운로드로 fallback 한다.
- 운동별 메모가 있으면 완료 요약 카드와 공유 이미지에 함께 표시한다.
- 공유 이미지에는 전체 운동과 전체 세트를 표시하며 임의로 4세트까지만 자르지 않는다.
- 데스크톱 화면에서도 운동명이 잘리지 않도록 완료 카드의 운동명은 줄바꿈을 허용한다.
- Web Share API 호출 시 별도 메시지/title은 넘기지 않고 이미지 파일만 공유한다.
- 완료 요약 화면은 공유 카드 중심으로 간결하게 유지하고, 별도 TOP 랭킹/히스토리 목록은 표시하지 않는다.

## 모바일 Flutter 개발 기준

Flutter 앱은 `mobile/`에 별도 프로젝트로 관리한다.

모바일 MVP 범위:

- 로그인/회원가입
- 로그인 세션 저장
- 홈 캐릭터/아바타 화면
- 운동 카탈로그 조회와 fallback 운동 목록
- 운동 시작/운동 기록 추가/운동 종료
- 1RM 계산기
- 상점에서 캐릭터/펫 구매와 장착
- 내 활동 캘린더와 최근 운동 목록

모바일 1차 범위에서 제외한 것:

- 주식 현재가 기능
- 루틴 설계 고도화
- 완료 요약 공유 이미지 생성
- 옷/악세사리 레이어 합성
- 상점/인벤토리 서버 저장
- JWT/정식 인증 전환

모바일 구조 기준:

- `mobile/lib/src/app/`에는 앱 진입, 테마, 화면 조립 코드를 둔다.
- `mobile/lib/src/core/`에는 API client, 로컬 저장소 같은 인프라 코드를 둔다.
- `mobile/lib/src/data/`에는 앱 내 고정 카탈로그와 fallback 데이터를 둔다.
- `mobile/lib/src/shared/`에는 공용 모델과 유틸을 둔다.
- 기능이 커지면 `mobile/lib/src/features/` 아래로 auth/home/workout/shop/activity 단위 분리를 진행한다.

모바일 상태/저장 기준:

- Flutter API 주소는 `--dart-define=API_BASE_URL=...`로 주입한다.
- 기본 API 주소는 `http://localhost:8080`이다.
- iOS Simulator에서는 보통 `http://localhost:8080`로 로컬 백엔드 접근이 가능하다.
- 실제 iPhone에서는 `localhost`가 Mac이 아니라 iPhone 자신을 가리키므로 Mac의 같은 Wi-Fi 내부 IP나 배포 백엔드 URL을 사용한다.
- Flutter Web은 실행 포트가 달라질 수 있으므로 백엔드 CORS에서 `http://localhost:*`, `http://127.0.0.1:*` origin pattern을 허용한다.
- 웹의 localStorage 역할은 Flutter에서 `shared_preferences`로 처리한다.
- 현재 모바일 MVP도 웹과 같은 임시 key 의미를 유지한다.
  - 로그인 세션: `repick-mock-session`
  - 캐릭터 선택: `repick-avatar-selection:{user.id}`
  - 상점 상태: `repick-shop-state:{user.id}`
- 앱 출시 전에는 인증을 `X-User-Id`에서 JWT/세션 기반으로 바꾸고, 닭가슴살/상점/인벤토리를 백엔드 API로 이전하는 것을 우선 검토한다.

모바일 에셋 기준:

- 웹의 `frontend/public/avatars/`, `frontend/public/companions/`, `frontend/public/exercises/` 이미지를 `mobile/assets/` 아래에 복사해 사용한다.
- 새 캐릭터/펫/운동 이미지를 추가하면 웹 public 에셋과 모바일 assets 등록을 함께 확인한다.
- 모바일 운동 이미지는 `mobile/lib/src/data/repick_catalog.dart`의 `getExerciseAssetPath(name)` 키워드 규칙으로 매핑한다.
- 웹의 `getExerciseAssetUrl(name)` 규칙을 모바일에도 맞춰 유지하며, 운동명/기구명이 추가되면 두 매핑을 함께 갱신한다.

## 주식 현재가 기능

TradingView 위젯은 제거했고, 한국투자증권 KIS REST API 기반 현재가 카드로 대체했다.

백엔드 구조:

- `backend/src/main/java/com/healthtracker/api/market/api/MarketQuoteController.java`
- `backend/src/main/java/com/healthtracker/api/market/api/MarketQuoteDtos.java`
- `backend/src/main/java/com/healthtracker/api/market/domain/KisAccessTokenCache.java`
- `backend/src/main/java/com/healthtracker/api/market/domain/MarketWatchlist.java`
- `backend/src/main/java/com/healthtracker/api/market/repository/KisAccessTokenCacheRepository.java`
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

- KIS OAuth token은 `kis_access_tokens` 컬렉션에 캐싱한다.
- `KisAccessTokenProvider`는 app key 기반 cache id로 DB 캐시를 먼저 조회한다.
- 토큰이 없거나 만료 5분 전이면 `/oauth2/tokenP`로 재발급한 뒤 DB에 저장한다.
- 서버 재시작/Render sleep 이후에도 DB 캐시가 유효하면 재사용한다.
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
- KIS access token 캐시는 서버 메모리에서 MongoDB로 전환했다.
- `kis_access_tokens` 컬렉션에는 app key 기반 cache id, access token, expiresAt, updatedAt을 저장한다.
- `expiresAt`, `updatedAt`은 서버 타임존 차이를 피하기 위해 Instant 기준으로 저장한다.
- 여러 서버/로컬 환경에서 동시에 토큰을 발급받는 문제를 줄이기 위해 `KisAccessTokenProvider`가 먼저 DB 캐시를 조회하고, 없거나 만료 임박일 때만 `/oauth2/tokenP`를 호출한다.

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

## 캐릭터/펫 이미지 에셋

캐릭터 에셋:

- 기본 캐릭터 이미지는 `frontend/public/avatars/`에 저장한다.
- 현재 남자 캐릭터는 `male-character-1.png`부터 `male-character-4.png`까지 있다.
- 현재 여자 캐릭터는 `female-character-1.png`부터 `female-character-4.png`까지 있다.
- 캐릭터 이미지는 회원가입 시 입력한 성별에 맞는 후보만 노출한다.
- 캐릭터 2, 3번은 기본 선택 가능 캐릭터다.
- 캐릭터 1, 4번은 상점에서 닭가슴살로 잠금해제하는 캐릭터다.

펫 에셋:

- 펫 이미지는 `frontend/public/companions/`에 저장한다.
- 현재 펫 이미지는 `cat-brown-1.png`, `cat-brown-2.png`, `cat-brown-3.png`이다.
- 사용자가 제공한 원본 PNG를 사용하며, 임의로 새로 그린 SVG 펫은 사용하지 않는다.
- 펫 이미지는 흰 배경을 투명 처리한 PNG다.
- 펫은 상점에서 구매 후 장착하면 홈 캐릭터 방과 상점 미리보기 영역에 표시한다.

## 디자인 기준

- Repick은 깔끔하고 실용적인 앱처럼 느껴져야 한다.
- 데스크톱 장식보다 모바일 사용성을 우선한다.
- 로그인 이후 화면은 랜딩페이지처럼 만들지 않는다.
- 한국어 UI 문구는 짧고 명확하게 쓴다.
- 카드 radius는 과하게 둥글게 만들지 않는다.
- 아이콘이 필요하면 기존 `lucide-react`를 우선 사용한다.
- 사용자가 요청하지 않는 한 큰 UI 라이브러리를 추가하지 않는다.
- 제품 기본 포인트 컬러는 기존 운동 기록 화면과 맞춘 파란색 계열이다.
- public 화면, 홈 캐릭터 화면, 캐릭터 선택 모달, 상점 화면은 `#0a66d8`, `#f1f6ff`, 딥 네이비 계열을 중심으로 통일한다.
- 민트/피치 계열은 캐릭터 화면의 주 색상으로 다시 확장하지 않는다.

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

모바일:

```bash
cd mobile
flutter pub get
flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8080
flutter analyze
flutter test
```

iOS Simulator 확인:

```bash
open -a Simulator
cd mobile
flutter run --dart-define=API_BASE_URL=http://localhost:8080
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
  - 모바일 변경: `cd mobile && flutter analyze && flutter test`

## 현재 주의사항

- `README.md`에는 예전 OAuth/JPA 기반 설명이 일부 남아 있을 수 있으므로 이후 갱신이 필요하다.
- 운동 기록은 백엔드 세션 API와 연결되었고, 백엔드 호출 실패 시 로컬 fallback으로 동작한다.
- 운동 카탈로그 API는 백엔드와 프론트 연결이 완료되었고, 실패 시 프론트 목업 fallback을 사용한다.
- 프론트의 운동 시작, 운동 추가, 운동 종료 흐름은 운동 세션 API와 연결되었다.
- 백엔드 호출이 실패하면 운동 화면은 로컬 세션 fallback으로 계속 동작한다.
- 즐겨찾기 운동은 아직 백엔드 저장이 아니라 localStorage 기반이다.
- 캐릭터 선택, 상점 구매/장착, 사용한 닭가슴살, 무료 지급 닭가슴살은 아직 백엔드 저장이 아니라 localStorage 기반이다.
- 닭가슴살 보유량은 현재 프론트 계산식 기반 MVP이며, 정식 출시 전에는 서버 저장 재화/인벤토리 구조로 이전해야 한다.
- 주식 관심 종목과 KIS access token 캐시는 백엔드 MongoDB에 저장한다.
- 프론트 화면 라우팅은 History API 직접 구현이므로, 화면 추가 시 `parseAppRoute()`, `getAppRoutePath()`, `navigateToView()`를 함께 확인해야 한다.
- 모바일 앱은 초기 MVP 골격이 생성되었고, 현재는 `shared_preferences` 기반 임시 로컬 저장과 기존 Spring API 호출을 사용한다.
- 모바일 앱은 주식 현재가 기능을 1차 범위에서 제외한다.
- 모바일 앱의 실제 iPhone 테스트는 케이블 연결 후 Developer Mode/기기 신뢰 설정을 완료한 뒤 진행한다.
- 모바일 앱 로그인 세션은 `shared_preferences`에 저장되며, 앱 삭제/재설치가 아니라면 재실행 시 유지된다.
- 모바일 앱은 비밀번호를 로컬 저장하지 않고, 최근 로그인 이메일만 `repick-last-login-email` key로 저장해 로그인 화면에 자동 입력/빠른 입력한다.
- 모바일 앱에서 운동 시작은 우선 로컬 임시 세션으로만 열고, 첫 운동 기록을 저장할 때 서버 `POST /api/workout-sessions/start`를 호출한다.
- 모바일 앱에서 운동 없이 종료하면 로컬 임시 세션만 제거하고 DB에는 저장하지 않는다. 예전 버전에서 생성된 빈 서버 세션은 종료 시 `DELETE /api/workout-sessions/{sessionId}`로 제거한다.
- 모바일 앱 상점 탭과 홈 상점 진입 버튼은 추후 고도화를 위해 현재 숨겨두었다.

## 다음 세션 인수인계 메모

이번 세션에서 완료한 주요 작업:

- Flutter 앱 프로젝트를 `mobile/`에 생성했다.
- Flutter 프로젝트 이름은 `repick`, org는 `com.sasca37`로 생성했다.
- Flutter 타깃은 iOS/Android/Web을 생성했지만, MVP 우선 확인은 Chrome과 iOS Simulator 기준으로 진행한다.
- 웹의 캐릭터/펫/운동 이미지 에셋을 `mobile/assets/avatars/`, `mobile/assets/companions/`, `mobile/assets/exercises/`로 복사했다.
- `mobile/pubspec.yaml`에 `http`, `shared_preferences` 의존성과 assets 경로를 등록했다.
- `mobile/lib/main.dart`를 Repick 앱 진입점으로 교체했다.
- `mobile/lib/src/app/app_theme.dart`에 기존 웹과 맞춘 `#0a66d8`, `#f1f6ff`, 딥 네이비 중심 테마를 추가했다.
- `mobile/lib/src/shared/models.dart`에 User, Exercise, WorkoutSession, WorkoutRecord, WorkoutSet, ShopState 모델을 추가했다.
- `mobile/lib/src/core/api_client.dart`에 기존 Spring API 호출용 Flutter API client를 추가했다.
- `mobile/lib/src/core/local_store.dart`에 로그인 세션, 캐릭터 선택, 상점 상태 저장소를 추가했다.
- `mobile/lib/src/data/repick_catalog.dart`에 모바일 캐릭터/펫 카탈로그와 fallback 운동 목록을 추가했다.
- `mobile/lib/src/app/repick_app.dart`에 로그인/회원가입, 홈 캐릭터, 운동 기록, 1RM, 상점, 활동 탭의 초기 MVP 화면을 구현했다.
- 모바일 운동 기록은 기존 백엔드 운동 세션 API를 먼저 호출하고, 실패 시 로컬 임시 세션으로 기록 흐름을 이어가도록 했다.
- 모바일 닭가슴살 계산식은 웹 MVP와 같은 `완료 세션 수 * 5 + 저장 세트 수 * 2 + 운동한 날짜 수 * 8 + 계정별 지급분 + 무료 지급분 - 사용분`을 사용한다.
- 모바일에서도 `sasca37@naver.com` 계정에 닭가슴살 100,000개 지급분을 적용했다.
- 모바일 상점은 1차로 캐릭터 잠금해제와 펫 구매/장착을 지원한다.
- 주식 현재가 기능은 모바일 MVP 1차 범위에서 제외했다.
- Flutter Web 로그인 시 `failed to fetch`가 발생하던 문제를 해결하기 위해 백엔드 CORS를 `allowedOriginPatterns` 기반으로 바꾸고, 로컬 Flutter Web origin인 `http://localhost:*`, `http://127.0.0.1:*`를 허용했다.
- 모바일 운동 기록 화면에 웹의 운동 이미지 매핑 규칙을 이식하고, 운동 목록/이번 운동 기록 카드에 `mobile/assets/exercises/` 대표 이미지를 표시하도록 했다.
- 모바일 운동 목록 UI를 기존 단순 `ListTile`에서 이미지 썸네일, 설명, 부위/패턴 태그가 있는 카드형으로 수정해 웹 `machine-card` 톤에 더 가깝게 맞췄다.
- 모바일 세트 입력 바텀시트를 웹의 `record-form` 구조에 맞춰 운동 헤더, 세트 기록 설명, 휴식 타이머, 휴식 시간 stepper, 세트 추가/삭제, 세트완료 버튼, 메모, 하단 초기화/저장 액션으로 재구성했다.
- 모바일 세트완료 버튼을 누르면 휴식 타이머가 실제로 카운트다운되며, 완료된 세트 행은 파란 배경 톤으로 표시한다.
- 모바일 기록 탭 메인 화면을 웹의 `record-session-page` 구조에 맞춰 오늘 운동 헤더, 진행 시간, 세션 타이머 버튼, 어두운 `workout-log-stage`, 빈 기록 카드, 기록 카드, 시작/종료 및 운동 추가 액션으로 재구성했다.
- 모바일 기록 탭에서 운동 목록은 메인 화면에 바로 노출하지 않고, 웹의 `exercise-picker-panel` 흐름처럼 `운동 추가` 바텀시트에서 고르도록 변경했다.
- 모바일 운동 추가 바텀시트는 웹의 빠른 선택/부위 세그먼트/내 기구 등록 안내/기구 카드 그리드 구성을 Flutter로 재현했다. 커스텀 기구 등록 버튼은 현재 비활성 placeholder이며, 이후 API 연결과 함께 활성화한다.
- Flutter Web에서 기록 탭 `운동 추가` 클릭 시 assertion/빈 화면이 날 수 있어, 운동 추가 바텀시트의 기구 카드 영역을 중첩 `GridView` 대신 `LayoutBuilder` + `Wrap` 기반 고정 크기 카드로 변경했다.
- 모바일 운동 추가 바텀시트는 로딩 중에도 fallback 운동 목록을 먼저 보여주고, 상단에 얇은 progress bar만 표시한다.
- 모바일 기록 탭 테스트에 `Record tab opens exercise picker` 케이스를 추가해 `운동 추가` 클릭 후 패널 제목이 렌더링되는지 검증한다.
- Flutter Web에서 기록 탭 `운동 추가` 클릭 시 `mouse_tracker.dart` assertion과 `Unexpected null value`가 계속 발생해, 운동 추가/세트 입력 바텀시트의 drag handle과 drag interaction을 끄고, 운동 추가 패널 내부의 `InkWell`, `ChoiceChip`, `TextButton`, 비활성 `OutlinedButton`, `Card + InkWell` 조합을 `GestureDetector + Container` 기반으로 교체했다.
- 모바일 앱의 숫자 입력 키보드가 닫히지 않아 세트 입력 화면을 빠져나가기 어려운 문제를 줄이기 위해 앱 전역 바깥 탭 unfocus, 세트/1RM 숫자 입력의 `TextInputAction`, 세트 입력 바텀시트 하단 액션 영역의 keyboard inset 반영, 키보드 노출 시 `키보드 닫기` 액션을 추가했다.
- 모바일 앱 로그인 반복 입력 부담을 줄이기 위해 로그인 성공 이메일을 `shared_preferences`에 저장하고, 로그인 화면에서 최근 이메일 자동 입력/빠른 입력 버튼과 OS autofill hint를 추가했다. 비밀번호는 저장하지 않는다.
- 모바일 앱에서 `운동 시작`은 서버 저장 없이 로컬 임시 세션으로 시작하고, 첫 운동 기록 저장 시 서버 세션을 생성하도록 변경했다.
- 모바일 앱에서 운동 기록 없이 종료하면 DB에 저장하지 않고 진행 중 세션만 제거한다. 이전 버전에서 만들어진 빈 서버 세션은 종료 시 삭제 API로 제거한다.
- 모바일 앱에서 기록이 있는 운동을 종료하면 완료 세션으로 반영한 뒤 서버 세션 목록을 다시 조회하고 활동 탭으로 이동한다.
- 모바일 앱 하단 내비게이션에서 상점 탭을 숨기고, 홈 화면의 상점 버튼도 제거했다. 상점 관련 코드와 로컬 상태 구조는 추후 고도화를 위해 유지한다.
- 모바일 활동 탭을 웹과 같은 형태의 이번 달 운동일 요약, 캘린더, 선택 날짜 상세 세션 목록 구조로 재구성했다.
- 모바일 활동 탭의 선택 날짜 세션 카드에 `상세` 액션을 추가하고, 누르면 운동 상세 기록 바텀시트가 열리도록 구현했다.
- 모바일 운동 상세 기록 바텀시트에는 운동 날짜, 운동 시간, 세트 수, 반복 수, 총 볼륨, 운동별 이미지/부위/볼륨/메모/세트별 중량과 반복 수를 표시한다.
- 모바일 운동 상세 기록 바텀시트 UI를 웹 완료 요약 공유 카드와 더 비슷하게 맞췄다. 상단은 파스텔 그라데이션 헤더/REPICK 배지/통계 pill로 구성하고, 운동 목록은 카드 박스 대신 구분선 기반 행과 파란 원형 세트 배지로 표시한다.
- 모바일 실제 화면에서 상세 기록 UI가 크게 보이는 문제를 줄이기 위해 상세 바텀시트의 헤더 높이, 타이틀 크기, 통계 pill, 운동 이미지, 운동명, 세트 원형 배지, 행 여백을 한 단계 줄여 모바일 밀도를 조정했다.
- 모바일 운동 상세 기록에서 세트 배지가 운동 이미지 오른쪽 텍스트 컬럼 아래에서만 시작해 이미지 아래 공간이 비어 보이던 문제를 해결했다. 운동 이미지/텍스트 헤더 아래에 세트 배지 영역을 전체 폭으로 배치한다.
- 모바일 운동 상세 기록 바텀시트에 `share_plus` 기반 공유 기능을 추가했다. 상세 공유 카드 영역을 `RepaintBoundary`로 PNG 캡처한 뒤 시스템 공유 시트로 전달하며, Web에서는 `share_plus`의 다운로드 fallback을 사용한다.
- 모바일 1RM 계산기에 웹과 동일한 종목 선택 기능을 추가했다. 선택지는 스쿼트, 벤치프레스, 데드리프트, 오버헤드프레스이며 결과 카드에 `{선택 종목} 예상 1RM`을 표시한다.
- 홈 화면을 캐릭터/아바타 중심 화면으로 개편했다.
- 회원가입 시 입력한 성별에 맞춰 캐릭터 후보를 노출하고, 최초 선택 후 홈에 계속 표시하도록 했다.
- 캐릭터 변경 모달을 추가했다.
- 캐릭터 2, 3번은 기본 캐릭터로, 1, 4번은 상점 잠금해제 캐릭터로 구분했다.
- 기본 캐릭터 에셋을 `frontend/public/avatars/`에 추가했다.
- `/shop` 상점 화면을 추가했다.
- 상점 탭에서 캐릭터 잠금해제, 옷, 악세사리, 펫을 구매/장착할 수 있게 했다.
- 상점 상태는 `repick-shop-state:{user.id}` localStorage에 저장한다.
- 캐릭터 선택 상태는 `repick-avatar-selection:{user.id}` localStorage에 저장한다.
- 펫 에셋 `cat-brown-1.png`, `cat-brown-2.png`, `cat-brown-3.png`를 `frontend/public/companions/`에 연결했다.
- 사용자가 제공한 펫 PNG의 흰 배경을 투명 처리했다.
- 펫을 구매/장착하면 홈 캐릭터 옆에 표시되도록 했다.
- `sasca37@naver.com` 계정에 닭가슴살 100,000개 지급분을 추가했다.
- MVP용 `무료 닭가슴살 받기` 버튼을 상점 보유량 카드에 추가했고, 클릭 시 1,000개씩 누적되도록 했다.
- 무료 닭가슴살 지급분은 사용자별 localStorage 상점 상태에 저장한다.
- 로그아웃 public 화면을 `캐릭터를 키워보시겠어요?` 중심의 캐릭터 육성 홍보 배너로 개편했다.
- public 화면, 로그인 후 홈 화면, 캐릭터 선택 모달, 상점 화면을 기존 운동 기록 화면의 파란색 톤에 맞춰 통일했다.
- 최근 사용 기구 / 즐겨찾기 / 이전 세트 자동 불러오기 / 세트별 이전 기록 힌트를 프론트에 적용했다.
- 운동 선택 카드의 즐겨찾기 별표와 status-dot 겹침을 제거했다.
- 기구 세트 입력 화면에서 닫기 버튼을 누르면 기구 선택 화면으로 돌아가도록 수정했다.
- 주식 현재가 UI를 큰 카드형에서 한 줄 리스트형으로 간소화했다.
- 주식 현재가는 `$`와 소수점 둘째 자리로 표시하고, 등락률은 `base` 대비 계산해 색상을 적용했다.
- 사용자가 최대 5개 티커를 입력하고 MongoDB watchlist로 저장/관리하도록 구현했다.
- 관심 종목 추가/삭제 후 다른 종목 현재가가 초기화되거나 호출 대상에서 빠지는 문제를 보완했다.
- KIS `EXCD`를 한국시간 기준 데이장/정규장에는 `NAS`, 그 외에는 `BAQ`로 선택하도록 수정했다.
- 주식 목록에 조회 시각과 사용한 `EXCD`를 작게 표시했다.
- 운동 완료 요약 화면을 파스텔 헤더와 2열 운동 리스트 중심의 간결한 오운완 공유 카드로 개편했다.
- 공유 버튼으로 PNG 이미지를 생성하고 Web Share API 또는 다운로드 fallback을 사용하도록 했다.
- 운동 완료 공유 이미지는 기본 1080x1080으로 만들되, 운동/세트가 많으면 세로 길이를 자동 확장하도록 했다.
- 운동 완료 요약에 운동별 메모를 표시하고, TOP 랭킹/하단 히스토리 영역을 제거했다.
- 운동 완료 공유 이미지에서 전체 세트를 표시하고, Web Share API 메시지/title을 제거했다.
- 운동 완료 공유 이미지에서 세트가 여러 줄일 때 다음 운동과 겹치지 않도록 세트 줄 수 기준의 행 높이 계산을 보완했다.
- 운동 완료 카드의 세트 표시는 중량 원형 배지와 하단 반복 수 텍스트 형태로 변경했다.
- 데스크톱 운동 완료 화면에서 종목명이 잘리지 않도록 줄바꿈/레이아웃을 보완했다.
- 운동 기록 화면에서 완료된 오늘 기록을 다시 보여주지 않도록 정리했다.
- 내 활동 캘린더의 운동 날짜 표시는 초록색 숫자 배지로 표시하며, 숫자는 해당 날짜의 운동 세션 횟수다.
- 내 활동 화면 하단의 최근 세션 카드뷰 영역은 제거하고 캘린더/선택 날짜 상세 중심으로 정리했다.
- 운동 종료 버튼에 확인 팝업을 추가했다.
- 화면 이동에 URL 라우팅을 추가하고 뒤로가기를 지원하도록 했다.
- KIS access token 캐시를 서버 메모리에서 MongoDB `kis_access_tokens` 컬렉션으로 전환했다.

다음 창에서 바로 이어서 할 만한 작업:

1. `cd mobile && flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8080`로 모바일 앱 Chrome 실행을 확인한다.
2. 로컬 백엔드를 켠 상태에서 모바일 로그인/회원가입과 운동 세션 API 연결을 점검한다.
3. 모바일 운동 기록 화면에 최근 사용 기구/즐겨찾기/이전 세트 자동 불러오기를 이식한다.
4. 모바일 운동 완료 요약 화면을 웹 공유 카드 디자인에 맞춰 별도 탭/화면으로 구현한다.
5. 모바일 활동 캘린더에서 날짜 선택 상세를 웹처럼 보강한다.
6. 닭가슴살/상점/인벤토리를 MongoDB 백엔드 API로 이전할지 결정한다.
7. 펫/옷/악세사리 상품 목록의 실제 가격과 잠금 조건을 조정한다.
8. 장착한 옷/악세사리를 실제 캐릭터 이미지 위에 반영할 방식(별도 레이어 PNG, 캐릭터 합성 이미지, 단순 소품 표시)을 결정한다.
9. 백엔드 배포 대상(Render/Railway/Fly.io 등)을 확정한다.
10. 배포 환경에 `MONGODB_URI`, `KIS_APP_KEY`, `KIS_APP_SECRET`을 설정한다.
11. 프론트 배포 환경의 `VITE_API_BASE_URL`을 실제 백엔드 URL로 연결한다.
12. 실제 배포 환경에서 KIS 현재가와 운동 기록 API를 점검한다.

검증 상황:

- 모바일 Flutter 초기 MVP 생성 후 `cd mobile && flutter analyze` 성공.
- 모바일 Flutter 초기 MVP 생성 후 `cd mobile && flutter test` 성공.
- Flutter Web 로컬 CORS 허용 변경 후 `cd backend && ./gradlew test` 성공.
- 모바일 운동 에셋 매핑/카드 UI 변경 후 `cd mobile && flutter analyze` 성공.
- 모바일 운동 에셋 매핑/카드 UI 변경 후 `cd mobile && flutter test` 성공.
- 모바일 세트 입력 UI 웹 톤 재현 후 `cd mobile && flutter analyze` 성공.
- 모바일 세트 입력 UI 웹 톤 재현 후 `cd mobile && flutter test` 성공.
- 모바일 기록 탭/운동 추가 패널 웹 톤 재구성 후 `cd mobile && flutter analyze` 성공.
- 모바일 기록 탭/운동 추가 패널 웹 톤 재구성 후 `cd mobile && flutter test` 성공.
- 모바일 기록 탭 `운동 추가` Flutter Web assertion 대응 후 `cd mobile && flutter analyze` 성공.
- 모바일 기록 탭 `운동 추가` Flutter Web assertion 대응 후 `cd mobile && flutter test` 성공.
- 모바일 기록 탭 `운동 추가` Flutter Web assertion 대응 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 기록 탭 `mouse_tracker.dart` assertion 추가 대응 후 `cd mobile && flutter analyze` 성공.
- 모바일 기록 탭 `mouse_tracker.dart` assertion 추가 대응 후 `cd mobile && flutter test` 성공.
- 모바일 기록 탭 `mouse_tracker.dart` assertion 추가 대응 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 키보드 닫기/최근 이메일 자동 입력 개선 후 `cd mobile && flutter analyze` 성공.
- 모바일 키보드 닫기/최근 이메일 자동 입력 개선 후 `cd mobile && flutter test` 성공.
- 모바일 키보드 닫기/최근 이메일 자동 입력 개선 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 빈 운동 종료/상점 탭 숨김/활동 탭 웹 동작 재구성 후 `cd mobile && flutter analyze` 성공.
- 모바일 빈 운동 종료/상점 탭 숨김/활동 탭 웹 동작 재구성 후 `cd mobile && flutter test` 성공.
- 모바일 빈 운동 종료/상점 탭 숨김/활동 탭 웹 동작 재구성 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 활동 탭 운동 상세 기록 바텀시트 추가 후 `cd mobile && flutter analyze` 성공.
- 모바일 활동 탭 운동 상세 기록 바텀시트 추가 후 `cd mobile && flutter test` 성공.
- 모바일 활동 탭 운동 상세 기록 바텀시트 추가 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 운동 상세 기록 바텀시트 웹 공유 카드 스타일 반영 후 `cd mobile && flutter analyze` 성공.
- 모바일 운동 상세 기록 바텀시트 웹 공유 카드 스타일 반영 후 `cd mobile && flutter test` 성공.
- 모바일 운동 상세 기록 바텀시트 웹 공유 카드 스타일 반영 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 운동 상세 기록 바텀시트 밀도 조정 후 `cd mobile && flutter analyze` 성공.
- 모바일 운동 상세 기록 바텀시트 밀도 조정 후 `cd mobile && flutter test` 성공.
- 모바일 운동 상세 기록 바텀시트 밀도 조정 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 운동 상세 세트 영역 전체 폭 배치/공유 기능 추가 후 `cd mobile && flutter analyze` 성공.
- 모바일 운동 상세 세트 영역 전체 폭 배치/공유 기능 추가 후 `cd mobile && flutter test` 성공.
- 모바일 운동 상세 세트 영역 전체 폭 배치/공유 기능 추가 후 `cd mobile && flutter test --platform chrome` 성공.
- 모바일 1RM 계산기 종목 선택 추가 후 `cd mobile && flutter analyze` 성공.
- 모바일 1RM 계산기 종목 선택 추가 후 `cd mobile && flutter test` 성공.
- 모바일 1RM 계산기 종목 선택 추가 후 `cd mobile && flutter test --platform chrome` 성공.
- 캐릭터/상점/펫/free chicken 변경 후 `npm --prefix frontend run build` 성공.
- public/home 블루 톤 통일 후 `npm --prefix frontend run build` 성공.
- 최근 프론트 UX/공유 카드 변경 후 `npm --prefix frontend run build` 성공.
- 최근 백엔드 주식 기능 변경 후 `cd backend && ./gradlew test` 성공.
- KIS access token MongoDB 캐시 전환 후 `cd backend && ./gradlew test` 성공.
- 소셜 로그인과 이메일 인증은 추후 기능이다.
