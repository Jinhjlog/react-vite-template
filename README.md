# react-vite-template

React 19 + TypeScript + Vite 템플릿. **feature 경계와 복사 우선 정책을 린트로 강제**합니다.

노마드코더 기초 React 강의(CRA 기반)를 들은 뒤 이 프로젝트를 이어서 쓰는 분을 위한 안내입니다.

## 시작하기 (템플릿 복제 직후 1회)

```bash
npm install
npm run setup           # 프로젝트 이름·.env.local·첫 커밋 설정
```

`npm run setup` 은 대화형입니다. 프로젝트 이름을 물어보고 `package.json` · `index.html` · `README.md` 를 바꿔줍니다.

```bash
npm run setup -- --dry   # 미리보기 — 아무것도 바꾸지 않고 변경 예정만 출력
npm run setup -- --yes   # 전부 기본값으로 진행
npm run setup -- --name movie-app --api-url https://api.example.com
```

무엇이 바뀌는지 먼저 보고 싶으면 `--dry` 로 한 번 돌려보세요.

## 실행 방법

```bash
npm run dev     # 개발 서버 → http://localhost:5173
npm run build   # 배포용 빌드 (dist/ 생성)
npm run preview # 빌드 결과 미리보기
npm run lint    # 코드 검사
```

## 강의(CRA)와 다른 점

배우신 내용 중 **바뀌는 건 아래 6가지뿐**입니다. 컴포넌트, props, state, `useState`, `useEffect`,
이벤트 핸들링, `map()` 렌더링, React Router, fetch/axios, 배포는 전부 강의와 동일합니다.

|                 | 강의 (CRA)                  | 이 프로젝트 (Vite)         |
| --------------- | --------------------------- | -------------------------- |
| 개발 서버 실행  | `npm start`                 | `npm run dev`              |
| 접속 주소       | `localhost:3000`            | `localhost:5173`           |
| 진입 파일       | `src/index.js`              | `src/main.tsx`             |
| index.html 위치 | `public/index.html`         | 프로젝트 루트              |
| 컴포넌트 확장자 | `.js`                       | `.tsx`                     |
| 환경변수        | `process.env.REACT_APP_KEY` | `import.meta.env.VITE_KEY` |

### 환경변수 주의

`.env` 파일에 넣는 변수 이름은 반드시 `VITE_` 로 시작해야 브라우저에서 읽힙니다.

```
VITE_API_KEY=abcd1234
```

```ts
const key = import.meta.env.VITE_API_KEY;
```

## 폴더 구조

```
.
├── index.html          ← CRA의 public/index.html 자리
├── vite.config.ts      ← 빌드 설정
├── tsconfig.json       ← TypeScript 설정
├── .oxlintrc.json      ← 린트 규칙 (폴더 경계를 강제)
├── docs/
│   └── ARCHITECTURE.md ← 구조 규칙. 코드 짜기 전에 읽어주세요
├── public/             ← 그대로 복사되는 정적 파일
└── src/
    ├── features/       ← 기능 모듈. 대부분의 코드가 여기 들어갑니다
    ├── pages/          ← 화면. feature를 조합하는 자리
    ├── lib/            ← [고정] http 클라이언트
    ├── types/          ← [고정] 서버 응답 타입
    ├── styles/         ← [고정] 디자인 토큰
    ├── routes.tsx      ← 라우팅 정의
    ├── App.tsx
    ├── index.css
    └── main.tsx        ← CRA의 index.js 자리 (앱 진입점)
```

### AI 에이전트로 작업할 때

규칙은 **[`AGENTS.md`](./AGENTS.md)** 에 있습니다. Claude Code·Codex·Gemini CLI 등이 이 파일을 읽습니다. (`CLAUDE.md`는 이 파일을 임포트만 합니다.)

**세션을 시작하면 먼저 `지침확인` 이라고 입력하세요.** 에이전트가 규칙 문서 7개를 전부 읽고 `지침 확인 완료` 라고만 답합니다. 스킬 자동 호출이 가끔 누락되기 때문에, 작업 전에 한 번 숙지시키는 절차입니다.

사용할 수 있는 스킬 — 요청하면 자동으로 호출됩니다.

| 스킬             | 언제                              |
| ---------------- | --------------------------------- |
| `add-feature`    | "새 기능 만들어줘"                |
| `add-page`       | "페이지 추가해줘"                 |
| `copy-component` | "이 컴포넌트 저기서도 쓰고 싶어"  |
| `commit-bot`     | "커밋해줘" (레이어별로 분리 커밋) |

규칙 위반 점검은 `rule-auditor` 에이전트에게 시킵니다. 예: `"최근 변경 감사해줘"`

### ⚠️ 코드 짜기 전에 반드시

**[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) 를 먼저 읽어주세요.** 이 프로젝트에는 두 가지 중요한 규칙이 있습니다.

1. **다른 feature의 코드를 import할 수 없습니다** — 필요하면 복사하세요
2. **복사(중복)는 잘못이 아니라 이 프로젝트의 기본값입니다** — 공용화 리팩터링은 하지 않습니다

규칙을 어기면 `npm run lint` 에서 해결 방법과 함께 에러가 납니다.

### import 작성법

```ts
import { X } from "../types"; // 같은 feature 안 → 상대경로
import { http } from "@/lib/http"; // 공용 코드 → @/ 별칭
```

`@/` 는 `src/` 를 가리킵니다.

## 배포 (Docker)

```bash
npm run docker:build    # 이미지 빌드
npm run docker:run      # http://localhost:8080
```

멀티 스테이지입니다. Node로 빌드한 뒤 **결과물(`dist/`)만 nginx 이미지에 넣습니다.** 최종 이미지에 Node 런타임과 `node_modules`는 들어가지 않습니다 (61.9MB).

### ⚠️ 환경변수는 빌드 시점에 박힙니다

Vite의 `VITE_*` 변수는 번들 파일 안에 문자열로 들어갑니다. **컨테이너 실행 시 `-e` 로 넘겨도 반영되지 않습니다.**

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com -t react-vite-template .
```

Dokploy에서는 **Build Args** 입력란에 넣으세요. Environment 탭에 넣으면 적용되지 않습니다.

### Dokploy 배포

1. Application 생성 → 이 저장소 연결
2. Build Type을 **Dockerfile** 로 선택
3. Port를 **80** 으로 지정
4. `VITE_*` 값이 필요하면 Build Args에 추가
5. 도메인 연결 — Traefik이 SSL을 자동 발급합니다

## 기술 스택

| 영역            | 사용                                                      |
| --------------- | --------------------------------------------------------- |
| 프레임워크      | React 19 + Vite 8                                         |
| 언어            | TypeScript 6 (`strict`)                                   |
| 라우팅          | React Router 7                                            |
| 스타일          | **Tailwind CSS v4** — 색은 `src/styles/tokens.css` 토큰만 |
| 서버 상태       | **TanStack Query 5**                                      |
| 클라이언트 상태 | `useState` + `Context` (전역 상태 라이브러리 없음)        |
| HTTP            | `src/lib/http.ts` (자체 fetch 래퍼)                       |
| 폼              | 아직 없음                                                 |
| 린트            | oxlint                                                    |

**한 가지 방식으로만 합니다.** 위 표에 없는 라이브러리를 추가하기 전에 팀에 먼저 물어보세요. 규칙은 [`AGENTS.md`](./AGENTS.md) §1.6 에 있습니다.

### 색 쓰는 법

```tsx
<div className="bg-surface text-text-strong border border-border">
```

`bg-gray-100` 같은 Tailwind 기본 팔레트나 `bg-[#fff]` 같은 임의값은 쓰지 않습니다. 사용 가능한 토큰은 `bg-bg` `bg-surface` `border-border` `text-text` `text-text-strong` `text-text-muted` `text-accent` 입니다.

새 색이 필요하면 `src/styles/tokens.css` 의 **세 곳**(라이트 `:root`, 다크모드 블록, `@theme inline`)에 함께 추가하세요.

## Windows에서 개발할 때

### 줄바꿈(LF/CRLF) — 이 저장소는 이미 처리돼 있습니다

Windows는 줄바꿈을 `CRLF`(`\r\n`), macOS·Linux는 `LF`(`\n`)로 씁니다. 아무 설정이 없으면 이런 일이 벌어집니다.

- `warning: LF will be replaced by CRLF` 경고가 계속 뜸
- **한 글자도 안 고쳤는데 파일 전체가 수정된 것으로 잡힘** → diff가 통째로 빨개져서 리뷰 불가
- macOS 팀원과 서로 상대방 커밋을 되돌리는 핑퐁 발생

이 저장소에는 **`.gitattributes`** 가 있어서 이미 해결돼 있습니다.

```
* text=auto eol=lf
```

**`.gitattributes` 는 개인의 git 설정보다 우선합니다.** 그래서 이 저장소에서는 각자 아무 설정도 하지 않아도 됩니다.

### 명령어로 설정하는 방법 (다른 저장소용)

`.gitattributes` 가 없는 프로젝트에서는 개인이 직접 맞춰야 합니다. 이게 흔히 말하는 그 설정입니다.

```bash
# Windows
git config --global core.autocrlf true

# macOS / Linux
git config --global core.autocrlf input
```

| 값 | 저장소에 저장될 때 | 내 PC로 받을 때 |
| --- | --- | --- |
| `true` (Windows) | CRLF → **LF 변환** | LF → **CRLF 변환** |
| `input` (Mac/Linux) | CRLF → **LF 변환** | 변환 안 함 |
| `false` | 변환 안 함 | 변환 안 함 |

핵심은 **저장소에는 항상 LF만 들어가게** 하는 것입니다. 현재 설정 확인은 이렇게 합니다.

```bash
git config --get core.autocrlf
```

### 이미 CRLF로 받아버렸다면

경고가 계속 뜨거나 diff가 이상하면 재정규화합니다.

```bash
git add --renormalize .
git status                # 변경된 파일 확인
git commit -m "chore: 줄바꿈 정규화"
```

작업 중인 변경이 없다면 다시 클론하는 게 제일 깔끔합니다.

### 그 외 Windows에서 자주 막히는 것

**1. npm 실행이 차단됨**

```
npm : File C:\...\npm.ps1 cannot be loaded because running scripts is disabled
```

PowerShell을 관리자로 열고 한 번만 실행합니다.

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**2. 경로가 너무 길다는 에러**

`node_modules` 는 폴더 깊이가 깊어서 Windows의 260자 제한에 걸립니다.

```bash
git config --global core.longpaths true
```

**3. 파일명 대소문자 — 로컬은 되는데 배포가 깨짐**

Windows와 macOS는 파일명 대소문자를 구분하지 않지만, **Docker 빌드는 Linux라 구분합니다.**

```tsx
import { MovieCard } from './components/moviecard'   // ❌ 실제 파일은 MovieCard.tsx
```

내 PC에서는 잘 되다가 `npm run docker:build` 나 배포에서만 `Module not found` 가 납니다. **import 경로의 대소문자를 파일명과 정확히 맞추세요.**
