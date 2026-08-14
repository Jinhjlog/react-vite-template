---
name: add-feature
description: '이 프로젝트에 새 기능(feature) 폴더를 만들 때 사용한다. 트리거 - "기능 추가", "feature 만들어줘", "새 기능", "영화 목록 기능", "로그인 기능 만들어줘", "add feature", "create feature". 다른 feature의 코드를 재사용하지 말고 복사하는 이 프로젝트의 규칙을 지키며 스캐폴딩한다.'
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
user-invocable: true
---

# 새 feature 추가

> 전제: `AGENTS.md` §1을 따른다. 특히 **§1.2 복사가 기본값 / 승격 금지**.

## 만들 것

```
src/features/<기능이름>/
├── components/          # Presenter — props만 받는다
├── api/                 # 서버 호출 (필요할 때만)
├── hooks/               # 이 기능 전용 훅 (필요할 때만)
└── types.ts             # 이 기능 전용 타입
```

**필요한 것만 만든다.** 빈 폴더를 미리 만들지 않는다. 타입 하나만 필요하면 `types.ts` 하나만 만든다.

## 절차

### 1. 기존 구현 확인

`src/features/greeting/` 을 읽는다. 새 코드는 이 구조와 네이밍을 그대로 복제해서 시작한다.
다른 feature가 이미 있다면 가장 최근 것도 함께 본다.

### 2. 폴더 생성

`src/features/<기능이름>/` — kebab-case 또는 단수 명사. 이미 있는 이름과 겹치지 않는지 확인한다.

### 3. 타입 정의 (`types.ts`)

이 기능 안에서만 쓰는 타입을 둔다. **서버 응답 공통 타입(`ApiResponse` 등)은 `@/types/api`에서 가져온다.**

```ts
export interface Movie {
  id: string
  title: string
  year: number
}
```

### 4. API 계층 (`api/`) — 서버 호출이 있을 때만

```ts
import { http } from '@/lib/http'
import type { Movie } from '../types'

export function getMovies(): Promise<Movie[]> {
  return http<Movie[]>('/movies')
}
```

- 공용 코드는 `@/` 별칭, 같은 feature 안은 상대경로.
- `fetch`를 직접 쓰지 않는다. 반드시 `@/lib/http` 경유.

### 5. 훅 (`hooks/`) — TanStack Query

`useEffect` + `useState` 로 데이터를 가져오지 않는다. 반드시 `useQuery` / `useMutation` 을 쓴다.

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMovies, createMovie } from '../api/movies'

/** 쿼리 키는 이 feature 안에서만 관리한다. 다른 feature와 공유하지 않는다. */
export const movieKeys = {
  all: ['movies'] as const,
  list: () => [...movieKeys.all, 'list'] as const,
  detail: (id: string) => [...movieKeys.all, 'detail', id] as const,
}

export function useMovies() {
  return useQuery({
    queryKey: movieKeys.list(),
    queryFn: getMovies,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
    },
  })
}
```

### 6. 컴포넌트 (`components/`) — Presenter

**props로만 데이터를 받는다.** `api/`·`hooks/`·`@/lib/http` import는 린트가 막는다.

```tsx
import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <p className="font-semibold text-text-strong">{movie.title}</p>
      <p className="mt-1 text-sm text-text-muted">{movie.year}</p>
    </article>
  )
}
```

**스타일 규칙**

- **Tailwind 클래스만** 쓴다. 인라인 `style={{}}` 과 별도 `.css` 파일은 금지.
- 색은 **토큰 클래스만** — `bg-surface` `text-text-strong` `text-text-muted` `border-border` `text-accent` `bg-bg`.
  Tailwind 기본 팔레트(`bg-gray-100`)와 임의값(`bg-[#fff]`)은 금지.
- 간격·모서리·글자 크기는 **Tailwind 기본 스케일** (`p-4` `gap-2` `rounded-lg` `text-sm`).
- `useState` 같은 로컬 UI 상태는 써도 된다. 금지되는 것은 데이터 취득이다.

새 색이 필요하면 `src/styles/tokens.css` 의 `:root` · 다크모드 블록 · `@theme inline` **세 곳 모두**에 추가한다.

### 7. 페이지에 연결

feature 자체로는 화면에 나오지 않는다. `.claude/skills/add-page` 절차로 페이지를 만들어 연결한다.

### 8. 검증

```bash
npm run lint && npm run build
```

## 다른 feature의 코드가 필요할 때

**import하지 않는다. 복사한다.**

```tsx
// @duplicate-of: src/features/greeting/components/GreetingCard.tsx
```

복사본 맨 위에 위 주석을 남긴다. 이유는 버그 수정 시 `grep -r "@duplicate-of" src` 로 형제 복사본을 찾기 위해서다.

두 기능을 함께 써야 한다면 복사 대신 **`pages/`에서 조합**하는 방법도 있다. 조합은 페이지의 일이다.

## 하지 말 것

- ❌ 다른 feature import (린트 에러)
- ❌ 중복이 보인다고 공용 폴더로 추출
- ❌ 쓰지도 않을 `components/`·`api/`·`hooks/` 폴더 미리 생성
- ❌ 배럴 파일(`index.ts`) 생성
- ❌ feature 폴더 2단계 초과 중첩

## 완료 보고 형식

```
✅ feature 추가 완료: <기능이름>

생성된 파일:
- src/features/<기능이름>/types.ts
- src/features/<기능이름>/components/<Xxx>.tsx
- ...

복사한 코드: (없으면 "없음")
- <복사본 경로> ← <원본 경로>

lint / build: 통과
다음 단계: 페이지 연결이 필요하면 add-page
```
