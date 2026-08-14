---
name: add-page
description: '이 프로젝트에 새 페이지(화면)와 라우팅을 추가할 때 사용한다. 트리거 - "페이지 추가", "화면 만들어줘", "라우트 추가", "새 페이지", "상세 페이지", "/movies 화면", "add page", "add route". 페이지가 feature를 조합하는 Container 역할을 지키도록 스캐폴딩한다.'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
user-invocable: true
---

# 새 페이지 추가

> 전제: `AGENTS.md` §1.4. **페이지는 Container다** — 데이터를 가져오고 feature를 조합한다.

## 페이지의 역할

페이지는 이 프로젝트에서 **유일하게 여러 feature를 import할 수 있는 자리**다.

```
pages/MoviePage.tsx
├── features/movies 의 컴포넌트를 가져다 쓰고
├── features/search 의 컴포넌트도 가져다 쓰고
└── 데이터를 호출해 props로 내려준다
```

feature끼리는 서로 모른다. 둘을 만나게 하는 것이 페이지의 일이다.

## 절차

### 1. 기존 페이지 확인

`src/pages/HomePage.tsx` 와 `src/pages/RootLayout.tsx` 를 읽는다. 구조와 네이밍을 그대로 복제해 시작한다.

### 2. 페이지 파일 생성

**기본은 파일 하나다.** `src/pages/<이름>Page.tsx` — PascalCase, `Page` 접미사.

폴더는 **그 라우트에 파일이 2개째 필요해질 때** 만든다. 처음부터 폴더를 파지 않는다.

```
src/pages/
├── HomePage.tsx              # 파일 하나면 충분한 페이지
└── movies/                   # 목록·상세가 생겨서 폴더로 승격한 경우
    ├── MovieListPage.tsx
    ├── MovieDetailPage.tsx
    └── components/           # 이 라우트 전용
        └── MovieFilterBar.tsx
```

기존에 `pages/MovieListPage.tsx` 하나만 있다가 상세 페이지가 추가되는 상황이라면,
**두 파일을 `pages/movies/` 로 함께 옮기고** `routes.tsx` 의 import 경로를 고친다.

```tsx
import { MovieCard } from '@/features/movies/components/MovieCard'
import { useMovies } from '@/features/movies/hooks/useMovies'

export function MoviePage() {
  const { data: movies, isPending, isError } = useMovies()

  if (isPending) return <p className="text-text-muted">불러오는 중…</p>
  if (isError) return <p className="text-text-muted">불러오지 못했습니다.</p>
  if (movies.length === 0)
    return <p className="text-text-muted">등록된 영화가 없습니다.</p>

  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-semibold text-text-strong">영화</h1>
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </main>
  )
}
```

- feature import는 `@/features/...` 별칭을 쓴다.
- **데이터 호출은 여기서 한다.** 컴포넌트에 넘길 때는 props로.
- 데이터는 **TanStack Query 훅**으로 가져온다. `useEffect` + `useState` 패칭은 금지.
- 스타일은 **Tailwind 클래스**. 색은 토큰 클래스(`text-text-muted` 등)만 쓴다.

### 3. 라우트 등록 (`src/routes.tsx`)

```tsx
import { MoviePage } from '@/pages/MoviePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies', element: <MoviePage /> },        // 목록
      { path: 'movies/:id', element: <MovieDetailPage /> }, // 상세
    ],
  },
])
```

### 4. 내비게이션 링크 (필요하면)

`src/pages/RootLayout.tsx` 의 `<nav>` 에 `<Link to="/movies">영화</Link>` 를 추가한다.

### 5. URL 파라미터를 쓰는 경우

```tsx
import { useParams } from 'react-router-dom'

export function MovieDetailPage() {
  const { id } = useParams()
  // id는 string | undefined — 없을 때 처리 필요
  if (!id) return <p>잘못된 접근입니다.</p>
  ...
}
```

### 6. 검증

```bash
npm run lint && npm run build
```

### 7. 화면 확인 (필수)

**페이지를 만들었으면 눈으로 확인한다.** 빌드 통과는 화면이 제대로 나온다는 뜻이 아니다.

```bash
lsof -ti:5173        # 이미 떠 있으면 그 서버를 쓴다 (죽이지 않는다)
npm run dev          # 없을 때만 띄운다
```

Playwright MCP로 `http://localhost:5173<경로>` 에 접속해 스크린샷을 찍고 확인한다.

**스크린샷 파일명에는 반드시 `.playwright-mcp/` 경로를 붙인다.**

```
filename: ".playwright-mcp/movies-list.png"   ✅
filename: "movies-list.png"                    ❌ 프로젝트 루트에 떨어진다
```

- 레이아웃이 깨지지 않았는지
- 색이 토큰대로 나오는지 (다크모드 포함)
- 4상태가 실제로 보이는지 (빈 목록·로딩·에러)
- 긴 텍스트가 넘치지 않는지

**내가 띄운 서버는 확인 직후 내린다.** 스크린샷을 못 찍었으면 "확인함"이라고 보고하지 않는다.

## 화면 상태 처리 (4상태)

데이터를 가져오는 페이지는 네 가지 상태를 **모두** 처리한다. 하나라도 빠지면 사용자에게 빈 화면이 보인다.

| 상태 | TanStack Query | 표시 |
| ---- | -------------- | ---- |
| 로딩 | `isPending` | "불러오는 중…" |
| 에러 | `isError` | 안내 문구 (+ 필요하면 `refetch` 버튼) |
| 빈 목록 | `data.length === 0` | "등록된 항목이 없습니다" |
| 성공 | 나머지 | 실제 내용 |

**순서가 중요하다.** `isPending` → `isError` → 빈 목록 → 성공 순으로 먼저 걸러야
`data` 가 `undefined` 인 상태에서 `.map()` 을 돌리는 사고가 나지 않는다.
`strict` 모드가 켜져 있어서 순서를 틀리면 타입 에러로 잡힌다.

## 페이지 전용 컴포넌트를 파일로 뺄 때

페이지가 커져서 컴포넌트를 별도 파일로 빼야 한다면 **그 라우트 폴더 안에** 둔다.

```
src/pages/movies/
├── MovieListPage.tsx
└── components/
    └── MovieFilterBar.tsx    # import 는 './components/MovieFilterBar'
```

- `features/`로 보내지 않는다. 공유되는 게 아니라 이 라우트 전용이다.
- **다른 라우트가 이 폴더를 import하면 린트 에러**다. 그쪽에서 필요하면 복사하고 `@duplicate-of` 주석을 남긴다.
- 라우트 폴더 안에서는 상대경로(`./components/...`)를 쓴다.

## 하지 말 것

- ❌ 페이지 전용 컴포넌트를 `features/`에 만들기 — 그 라우트 폴더의 `components/` 에 둔다
- ❌ 다른 페이지·다른 라우트의 코드를 import — 필요하면 복사한다 (린트 에러)
- ❌ `pages/` 최상단에 공용 컴포넌트 폴더 신설 — `components/` 는 항상 특정 라우트 폴더 **안에만** 둔다
- ❌ 라우트 폴더를 미리 만들기 — 파일이 2개째 필요해질 때 만든다
- ❌ 라우트를 `routes.tsx` 밖에서 정의

## 페이지가 길어질 때

한 파일에서 같은 JSX가 **2번 이상 반복될 때만** 같은 파일 안의 비공개 함수로 뽑는다.

```tsx
function StatCard({ label, value }: StatCardProps) {  // export 안 함
  return <div>{label}: {value}</div>
}

export function DashboardPage() {
  return (
    <>
      <StatCard label="매출" value={100} />
      <StatCard label="주문" value={50} />
    </>
  )
}
```

한 번만 쓰이면 **인라인이 낫다.** 이름을 붙이는 순간 읽는 사람이 선언부까지 점프해야 하고, 그 비용은 2번째부터 보상된다.
"나중에 재사용할 것 같아서"는 분리 사유가 아니다.

세 단계 이상 중첩(페이지 → 컴포넌트 → 그 하위 컴포넌트)이 필요해지면 페이지를 쪼개는 것을 고려한다.

## 완료 보고 형식

```
✅ 페이지 추가 완료: <경로>

생성/수정된 파일:
- src/pages/<Xxx>Page.tsx (신규)
- src/routes.tsx (라우트 등록)
- src/pages/RootLayout.tsx (링크 추가)

연결한 feature: <목록>
lint / build: 통과
화면 확인: 스크린샷으로 확인함 / 못 함(사유)
dev 서버: 내림 / 원래 떠 있던 서버 사용
```
