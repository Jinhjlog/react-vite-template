# AGENTS.md

React + TypeScript + Vite 프로젝트. 이 파일은 **코딩 에이전트가 지켜야 할 현재 유효한 규칙**만 담는다.
사람이 읽는 배경 설명은 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — 이 파일은 **무엇을**, 그 문서는 **왜**를 다룬다.

**답변 언어**: 모든 응답은 한국어로 작성한다.

---

## 「지침확인」 프로토콜

사용자가 **"지침확인"** 이라고 하면, 아래 문서를 **전부 직접 읽는다.**

1. `AGENTS.md` — 이 파일 (전체)
2. `docs/ARCHITECTURE.md` — 규칙의 근거
3. `.claude/skills/add-feature/SKILL.md`
4. `.claude/skills/add-page/SKILL.md`
5. `.claude/skills/copy-component/SKILL.md`
6. `.claude/skills/commit-bot/SKILL.md`
7. `.claude/agents/rule-auditor.md`

**지키는 것**

- **서브에이전트에게 요약시키지 않는다.** Read 도구로 본인이 직접 원문을 읽는다.
  요약은 누락을 만들고, 누락된 규칙은 지켜지지 않는다.
- 일부만 읽고 "나머지는 필요할 때 보겠다"로 넘어가지 않는다. **7개 전부 읽는다.**
- 스킬은 작업 중 자동 호출되지만 **호출이 누락되는 경우가 있다.** 이 시점에 미리 숙지해 두는 것이 목적이다.

**읽은 뒤 응답은 이 한 줄만 출력한다**

```
지침 확인 완료
```

요약·목록·소감을 덧붙이지 않는다. 사용자는 내용을 이미 알고 있고, 요약은 토큰만 쓴다.
확인 중 문서가 없거나 읽기에 실패한 경우에만 그 사실을 함께 보고한다.

---

## 0. 이 프로젝트가 다른 React 프로젝트와 다른 점

> ⚠️ **일반적인 React 베스트 프랙티스를 적용하면 이 프로젝트에서는 위반이 된다.**
> 특히 "중복 제거", "공용 컴포넌트로 추출", "DRY" 는 여기서 **금지된 행동**이다.

이 프로젝트를 쓰는 사람은 React 기초 강의 한 편을 들은 상태다. 최우선 목표는 코드 품질이나 재사용성이 아니라
**한 사람의 수정이 다른 사람의 화면을 깨뜨리지 않는 것**이다. 그 목적에 중복은 비용이 아니라 수단이다.

---

## 1. 절대 규칙

### 1.1 의존 방향 (린트가 강제)

```
pages  →  features  →  lib / types / styles
```

- `features/a` → `features/b` import **금지** (횡방향). 복사로 해결한다.
- `features/*` → `pages/*` import **금지** (역방향).
- `lib`·`types`·`styles` → `features`·`pages` import **금지** (역방향).
- feature 안에서 `../../` 이상의 상대경로 **금지** (폴더 밖 탈출).
- 순환 참조 **금지**.

위반 시 `npm run lint` 가 에러로 보고한다. **규칙을 우회하지 말고 규칙을 따르는 방향으로 고친다.**

### 1.2 복사가 기본값 — 승격 금지

> **복사는 이 프로젝트에서 승인된 행동이다. 중복을 발견해도 합치지 않는다.**

- 다른 feature의 코드가 필요하다 → **복사한다.**
- 비슷한 컴포넌트가 이미 있다 → **복사한다.**
- 중복이 3개든 5개든 → **그대로 둔다.**

**금지 행동** (요청받지 않았다면 절대 하지 않는다):

- ❌ 중복 컴포넌트를 공용으로 합치는 리팩터링
- ❌ `src/components/`, `src/hooks/`, `src/utils/`, `src/widgets/` 등 새 공용 폴더 생성
- ❌ "이거 공용으로 빼면 좋겠다"는 제안을 실행에 옮기는 것
- ❌ 사용자가 요청한 작업 범위 밖의 중복 정리

공용화(승격)는 **별도로 잡힌 기술부채 해결 기간에 사람이 결정**한다. 기능 개발 중에는 어떤 경우에도 하지 않는다.
사용자가 명시적으로 "공용으로 빼줘"라고 지시한 경우에만 수행하며, 그때도 영향받는 파일 전부를 먼저 보고한다.

**복사할 때는 복사본 맨 위에 출처를 남긴다:**

```tsx
// @duplicate-of: src/features/greeting/components/GreetingCard.tsx
```

### 1.3 고정 구역 — 여기는 복사하지 않는다

| 폴더          | 담는 것                    | 복사 금지 이유                           |
| ------------- | -------------------------- | ---------------------------------------- |
| `src/styles/` | 색상·간격 토큰             | 화면마다 값이 갈라짐                     |
| `src/lib/`    | http 클라이언트, 인증 처리 | 로그아웃·토큰갱신이 일부 화면에서만 동작 |
| `src/types/`  | 서버 응답 타입             | 서버 변경 시 타입 에러가 안 남           |

판단 기준: **생긴 것(표현)은 복사해도 되고, 사실(진실)은 복사하면 안 된다.**
가격 계산·유효성 규칙·로그인 판정처럼 **답이 하나여야 하는 것**은 `lib/`에 둔다.

### 1.4 컴포넌트 2분류 (린트가 강제)

| 타입          | 데이터 획득           | 위치                          |
| ------------- | --------------------- | ----------------------------- |
| **Presenter** | props로만 받음 (순수) | `features/<기능>/components/` |
| **Container** | 데이터 호출 + 조립    | `pages/`                      |

- `features/*/components/` 안에서 `@/lib/http`·`../api/*`·`../hooks/*` import **금지**.
  데이터는 `pages/`에서 가져와 props로 내려준다.
- `useState` 같은 **로컬 UI 상태는 Presenter에서도 허용**한다. 금지되는 것은 데이터 취득이다.
- `pages/`는 여러 feature를 자유롭게 import할 수 있다. **조합은 페이지의 일이다.**
- `widgets/` 레이어는 **만들지 않는다.** 스스로 데이터를 가져오는 자립형 공용 UI는 곧 공용 폴더이므로 §1.2 위반이다.

**`pages/` 폴더 구조 — 게으른 폴더화**

파일 하나로 시작하고, **그 라우트에 파일이 2개째 필요해지는 시점에** 폴더로 승격한다. 선제적으로 폴더를 만들지 않는다.

```
src/pages/
├── HomePage.tsx              # 단순한 페이지는 파일 하나로 끝
├── AboutPage.tsx
└── movies/                   # 파일이 2개째 필요해진 순간 폴더화
    ├── MovieListPage.tsx
    ├── MovieDetailPage.tsx
    └── components/           # 이 라우트 전용 (다른 라우트는 접근 금지)
        └── MovieFilterBar.tsx
```

- `pages/<라우트>/components/` 는 **그 라우트 전용**이다. 다른 라우트가 import하면 린트 에러.
  필요하면 자기 라우트로 **복사**하고 `@duplicate-of` 주석을 남긴다.
- 페이지끼리 서로 import **금지** (`@/pages/*`). 라우트 등록은 `src/routes.tsx` 에서만 한다.
- 라우트 폴더 밖으로 나가는 `../../` 상대경로 **금지**. feature는 `@/features/...` 로 가져온다.
- 라우트 폴더 안에서는 상대경로(`./components/MovieFilterBar`)를 쓴다.
- 한 페이지에서만 쓰는 작은 조각은 **폴더를 만들지 말고 페이지 파일 안에 그대로 둔다.**
  같은 파일에서 2번 이상 반복될 때만 같은 파일 안의 비공개 함수로 뽑는다.

### 1.5 코드 규칙

- `any`, `as` 단언, `@ts-ignore` 금지.
- **타입을 도저히 못 맞추는 예외 상황**에서는 `@ts-expect-error` + **이유 주석**만 허용한다.
  ```ts
  // @ts-expect-error 외부 라이브러리 타입 정의가 실제 응답과 다름 (v3.2 기준)
  ```
  `@ts-ignore`가 아니라 `@ts-expect-error`인 이유 — 나중에 그 줄의 에러가 사라지면 **`@ts-expect-error` 자체가 에러**가 되어
  자동으로 정리된다. `@ts-ignore`는 문제가 없어져도 영원히 남는다.
  이유 주석이 없는 `@ts-expect-error`는 위반이다.
- `enum` 금지 — `as const` 객체로 대체.
- `React.FC` 금지.
- 배럴 파일(`index.ts` 재export) 금지 — Vite 트리셰이킹을 망가뜨린다.
- import 경로: **같은 feature 안은 상대경로**(`../types`), **고정 구역은 `@/` 별칭**(`@/lib/http`).
- feature 폴더 깊이는 **2단계까지** (`features/movies/components/MovieCard.tsx` ✅ / 그 아래 하위 폴더 ❌).
- 파일명: 컴포넌트 `PascalCase.tsx`, 그 외 `camelCase.ts`. (기존 파일 관례를 먼저 확인하고 따른다)

### 1.6 표준 패턴 — 한 가지 방식으로만

| 영역 | 이것만 쓴다 | 금지 |
| --- | --- | --- |
| 스타일 | **Tailwind CSS v4** 클래스 | 인라인 `style={{}}`, 새 `.css` 파일, CSS-in-JS |
| 색상 | `src/styles/tokens.css` 의 토큰 클래스 (`bg-surface`, `text-text-strong`) | `#fff` 하드코딩, `bg-[#aabbcc]` 임의값, Tailwind 기본 팔레트(`bg-gray-100`) |
| 간격·모서리·폰트 | **Tailwind 기본 스케일** (`p-4`, `rounded-lg`, `text-sm`) | `tokens.css` 에 간격/모서리 변수 추가 |
| 서버 상태 | **TanStack Query** (`useQuery` / `useMutation`) | `useEffect` + `useState` 데이터 패칭 |
| HTTP | `@/lib/http` | `fetch` 직접 호출, `axios`·`ky` 추가 |
| 클라이언트 상태 | `useState` + `Context` | 전역 상태 라이브러리 도입 (필요하면 **사람에게 먼저 묻는다**) |
| 라우팅 | `react-router-dom` + `src/routes.tsx` | 다른 라우터, 파일 기반 라우팅 도입 |
| 폼 | **아직 정해지지 않음** | 임의로 라이브러리 고르지 말고 **사람에게 묻는다** |

**색상 규칙 보충** — Tailwind 기본 팔레트(`gray-500`, `blue-600` 등)를 쓰지 않는다.
이 프로젝트의 색은 `tokens.css` 에 정의된 의미 기반 토큰뿐이다. 새 색이 필요하면
`tokens.css` 의 `:root` · 다크모드 블록 · `@theme inline` 세 곳에 추가한 뒤 클래스로 쓴다.

**전역 CSS 금지 이유** — `src/index.css` 의 `@layer base` 외에 전역 스타일을 추가하지 않는다.
전역 CSS는 **어느 화면이 영향받는지 눈에 보이지 않는다.** 이 프로젝트가 폴더와 린트로 막아온 바로 그 문제다.

---

## 2. 작업 프로토콜

1. **요청받은 범위만 수정한다.** 지나가다 본 중복·구식 코드를 같이 고치지 않는다.
2. **새 라이브러리 추가 전 확인.** `package.json`에 이미 있는 것으로 되는지 먼저 본다. 추가가 필요하면 이유와 함께 먼저 묻는다.
3. **기존 패턴 모방.** 새 코드는 `src/features/greeting/`과 `src/pages/`의 구조·네이밍을 그대로 복제해 시작한다.
4. **작업 후 `npm run lint`와 `npm run build`를 돌린다.** 통과하지 못한 채로 완료 보고하지 않는다.
5. **보고-후-대기.** 요청받은 묶음을 중간 질문 없이 끝내고, 완료 보고 후 대기한다.
6. **커밋·push는 사람이 지시할 때만.** 머지는 항상 사람이 한다.

### 화면 확인 (Playwright MCP)

이 프로젝트에는 Playwright MCP가 붙어 있다 (`.mcp.json`). **UI를 만들거나 바꿨으면 눈으로 확인한다.**
`npm run build` 통과는 화면이 제대로 나온다는 뜻이 아니다. 레이아웃 깨짐·색 안 맞음·빈 화면은 빌드로 안 잡힌다.

**절차**

1. 5173 포트에 이미 dev 서버가 떠 있는지 먼저 확인한다.
   - macOS/Linux: `lsof -ti:5173`
   - Windows: `netstat -ano | findstr :5173`
2. 떠 있으면 **그대로 쓴다.** 사용자가 쓰던 서버일 수 있으므로 **절대 죽이지 않는다.**
3. 없으면 `npm run dev` 로 띄운다.
4. Playwright MCP로 `http://localhost:5173` 접속 → 해당 화면으로 이동 → 스크린샷 확인.
5. **내가 띄운 서버는 확인이 끝나는 즉시 내린다.** 남겨두면 다음 사람이 포트 충돌을 겪는다.

**지키는 것**

- 확인 대상: 레이아웃, 색(다크모드 포함), 빈 목록·로딩·에러 상태, 텍스트 잘림.
- **스크린샷은 반드시 `.playwright-mcp/` 안에 저장한다.** 파일명에 경로를 직접 붙인다.
  ```
  filename: ".playwright-mcp/home-dark.png"     ✅
  filename: "home-dark.png"                      ❌ 프로젝트 루트에 떨어진다
  ```
  `--output-dir` 설정은 스냅샷·콘솔 로그에만 적용되고 **스크린샷 파일명에는 적용되지 않는다.**
- `.playwright-mcp/` 는 gitignore 대상이다. **커밋하지 않는다.**
- Playwright MCP는 **확인 전용**이다. 브라우저에서 뭔가를 제출하거나 외부 사이트로 나가지 않는다.
- 확인 결과는 보고에 한 줄로 적는다. 스크린샷을 못 찍었으면 **"확인함"이라고 쓰지 않는다.**

### 규칙이 충돌할 때

- **명시 금지 > 기존 코드 사례.** 기존 코드가 규칙을 어기고 있어도 그것을 따르지 않는다.
- **이 파일 > docs/ > 일반적인 React 관행.**
- 판단이 서지 않으면 **추론하지 말고** 더 좁은 선택(복사·지역 배치)을 하고 보고에 적는다.

### 이미 기각된 제안 (다시 제안하지 않는다)

- 공용 `components/`·`hooks/`·`utils/` 폴더 신설 — §1.2에서 의도적으로 배제됨
- `widgets/` 레이어 도입 — §1.4
- 중복 컴포넌트 통합 — §1.2
- 배럴 파일로 import 정리 — §1.5

---

## 3. 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크(tsc) + 프로덕션 빌드
npm run lint     # 규칙 검사 (oxlint)
npm run preview  # 빌드 결과 미리보기

npm run docker:build   # 프로덕션 이미지 빌드
npm run docker:run     # 컨테이너 실행 (http://localhost:8080)
```

**Docker** — 멀티 스테이지(Node 빌드 → nginx 서빙). `VITE_*` 환경변수는 **빌드 시점에 번들에 박히므로**
런타임 `-e` 가 아니라 `--build-arg` 로 넘긴다. nginx 설정은 `docker/nginx.conf` (SPA 폴백 필수).

**`npm run setup`** — 템플릿을 복제한 사람이 **1회만** 실행하는 부트스트랩이다.
이름 치환·`.env.local` 생성·첫 커밋을 처리한다. **에이전트가 임의로 실행하지 않는다** (사람이 직접 돌린다).

---

## 4. 자산 지도

| 자산                  | 경로                                   |
| --------------------- | -------------------------------------- |
| 규칙 (이 파일)        | `AGENTS.md` — `CLAUDE.md`가 임포트     |
| 배경 설명 (사람용)    | `docs/ARCHITECTURE.md`                 |
| 린트 규칙             | `.oxlintrc.json`                       |
| 화면 확인 (MCP)       | `.mcp.json` — Playwright MCP           |
| 부트스트랩 (사람 전용) | `scripts/setup.mjs`                    |
| 배포 이미지           | `Dockerfile`, `docker/nginx.conf`      |
| 새 기능 추가 절차     | `.claude/skills/add-feature/`          |
| 새 페이지 추가 절차   | `.claude/skills/add-page/`             |
| 컴포넌트 복사 절차    | `.claude/skills/copy-component/`       |
| 레이어별 분리 커밋    | `.claude/skills/commit-bot/`           |
| 규칙 감사 (읽기 전용) | `.claude/agents/rule-auditor.md`       |
| 참고 구현             | `src/features/greeting/`, `src/pages/` |
