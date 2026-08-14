---
name: commit-bot
description: '이 프로젝트의 레이어 구조(pages → features → lib/types/styles)에 맞춰 변경사항을 레이어별로 분리 커밋한다. 트리거 - "커밋", "커밋해줘", "커밋 분리해줘", "변경사항 커밋", "commit", "git commit". push와 머지는 하지 않는다.'
allowed-tools: Read, Grep, Glob, Bash
user-invocable: true
---

# Git 커밋 (레이어별 분리)

> 전제: `AGENTS.md`. 의존 방향은 `pages → features → lib / types / styles`.
> **의존성이 낮은 레이어부터** 순서대로 커밋한다.

## 절대 금지

- ❌ **레이어 혼합 커밋** — 한 커밋에 여러 레이어 넣지 않는다
- ❌ **일괄 커밋** — `git add -A && git commit` 금지
- ❌ **feature 혼합** — `features/movies` 와 `features/auth` 는 각각 별도 커밋
- ❌ **모호한 메시지** — "WIP", "fix", "update" 단독 금지
- ❌ **자동 push / 머지** — 사용자가 명시적으로 요청할 때만
- ❌ **AI 작성자 표기** — `Co-Authored-By: Claude` 등 넣지 않는다
- ❌ **민감 파일** — `.env*`, 토큰, 키 파일이 섞였는지 확인 후 커밋
- ❌ **중복 통합 커밋** — 중복 컴포넌트를 하나로 합치는 변경이 섞여 있으면 커밋하지 말고
  **먼저 사용자에게 보고한다.** (`AGENTS.md` §1.2 — 승격은 기술부채 기간에 사람이 결정)

## 커밋 메시지 형식

```
<이모지> <레이어>: <요약 — 50자 이내>

- 변경사항 1
- 변경사항 2
```

- **한국어**로 작성
- 본문은 bullet (한 줄짜리 간단한 변경이면 생략 가능)

### 이모지

```
✨ feat      - 새 기능
📋 copy      - 다른 feature에서 코드 복사 (이 프로젝트 전용)
🐛 fix       - 버그 수정
🎨 style     - 스타일·토큰 변경
🔧 config    - 설정·빌드·린트
📝 docs      - 문서·에이전트 자산
🔥 remove    - 삭제
🎉 init      - 초기화
♻️ refactor  - 리팩터링 (⚠️ 중복 통합은 금지 — 위 참조)
```

### 레이어 프리픽스

| 프리픽스 | 경로 |
| --- | --- |
| `config` | `package.json`, `tsconfig*.json`, `vite.config.ts`, `.oxlintrc.json`, `.gitignore` |
| `styles` | `src/styles/**`, `src/index.css` |
| `types` | `src/types/**` |
| `lib` | `src/lib/**` |
| `features/<기능>` | `src/features/<기능>/**` — **기능별로 분리** |
| `pages` | `src/pages/**`, `src/routes.tsx`, `src/App.tsx`, `src/main.tsx` |
| `agent` | `AGENTS.md`, `CLAUDE.md`, `.claude/**` |
| `docs` | `docs/**`, `README.md` |

---

## 실행 절차

### 1. 저장소 확인

```bash
git rev-parse --is-inside-work-tree
```

git 저장소가 아니면 **`git init`을 임의로 실행하지 말고 사용자에게 물어본다.**

### 2. 기존 커밋 스타일 확인

```bash
git log --oneline -20
```

최근 커밋의 이모지·프리픽스·톤을 확인해 일관성을 유지한다. 커밋이 없으면 이 문서의 형식을 그대로 쓴다.

### 3. 변경사항 파악

```bash
git status --short
git diff --stat
git diff
git diff --cached
git ls-files --others --exclude-standard
```

staged · unstaged · untracked를 **모두** 본다. `.env` 같은 의심 파일이 있으면 사용자에게 확인한다.

### 4. 레이어별 분류

위 표대로 나눈다. `features/`는 **기능 이름별로 다시 쪼갠다.**

**함께 묶는 예외:**

- `package.json` + `package-lock.json` — 항상 같은 커밋
- 같은 feature 안의 `types.ts` + `components/` + `api/` — 한 기능이므로 한 커밋
- `AGENTS.md` + `.claude/**` — 에이전트 규칙과 스킬이 같이 바뀌면 한 커밋

### 5. 낮은 레이어부터 커밋

**순서 (반드시 준수):**

```
1. config     설정·빌드·린트
2. styles     디자인 토큰
3. types      서버 응답 타입
4. lib        http 클라이언트 등
5. features/<기능>   기능별로 각각 (서로 독립이라 순서 무관)
6. pages      화면·라우팅
7. agent      AGENTS.md · .claude/
8. docs       docs/ · README
```

예시:

```bash
# 1. styles
git add src/styles/tokens.css
git commit -m "$(cat <<'EOF'
🎨 styles: 경고 색상 토큰 추가

- --color-warning / --color-warning-bg 추가
- 다크모드 대응값 함께 정의
EOF
)"

# 2. features/movies
git add src/features/movies/
git commit -m "$(cat <<'EOF'
✨ features/movies: 영화 목록 기능 추가

- Movie 타입 정의
- getMovies API 호출 함수
- MovieCard Presenter 컴포넌트
EOF
)"

# 3. pages
git add src/pages/MoviePage.tsx src/routes.tsx
git commit -m "$(cat <<'EOF'
✨ pages: 영화 목록 페이지 추가

- /movies 라우트 등록
- movies feature 조합 + 4상태 처리
EOF
)"
```

### 6. 검증

```bash
git log --oneline -10
git status --short
```

working tree가 깨끗한지 확인한다. **push는 하지 않는다.**

---

## 이 프로젝트 전용 — 복사 커밋

다른 feature에서 코드를 복사해 온 변경은 `📋 copy` 로 커밋하고, **본문에 원본 경로를 반드시 적는다.**

```bash
git commit -m "$(cat <<'EOF'
📋 features/movies: GreetingCard 복사해 MovieCard 작성

- 원본: src/features/greeting/components/GreetingCard.tsx
- @duplicate-of 주석 추가
- Movie 타입에 맞게 props 변경, author 필드 제거
EOF
)"
```

커밋 전에 확인한다:

```bash
grep -rn "@duplicate-of" src/features/<기능>/
```

**`@duplicate-of` 주석이 없는 복사본이 있으면 커밋하지 말고 먼저 알린다.** 주석 없는 복사는 미완료다.

---

## 레이어별 메시지 템플릿

```
🔧 config: <무엇> 설정
🎨 styles: <토큰> 추가/변경
✨ types: <타입> 정의
✨ lib: <유틸> 추가
✨ features/<기능>: <기능> 구현
📋 features/<기능>: <컴포넌트> 복사
✨ pages: <경로> 페이지 추가
📝 agent: <규칙/스킬> 추가
📝 docs: <문서> 작성
```

### 특수 케이스

```
🐛 fix <레이어>: <문제> 수정
   - 재현 조건 / 원인 / 수정 내용

🔥 remove <레이어>: <대상> 제거
   - 제거 이유 / 영향 범위
```

**버그 수정 시 추가 확인** — 고친 코드에 복사본이 있으면 형제도 같은 버그인지 확인하고,
있으면 커밋 본문에 적는다. (고칠지는 사용자가 결정)

```bash
grep -rn "@duplicate-of: <고친 파일 경로>" src/
```

---

## Amend (push 전에만)

```bash
git log -1 --format='%an %ae'   # 본인 커밋 확인
git commit --amend --no-edit    # 파일 추가 후
```

push된 커밋에는 사용하지 않는다.

---

## 완료 전 체크리스트

- [ ] `git log --oneline -20` 으로 기존 스타일 확인했는가
- [ ] staged·unstaged·untracked 전부 파악했는가
- [ ] 레이어별로 분류했는가
- [ ] `features/`를 기능 단위로 분리했는가
- [ ] 낮은 레이어부터 순서대로 커밋했는가
- [ ] 각 커밋이 단일 레이어·단일 관심사인가
- [ ] 복사분에 `@duplicate-of` 주석이 있는가
- [ ] 중복 통합 변경이 섞여 있지 않은가
- [ ] `Co-Authored-By`를 넣지 **않았는가**
- [ ] 민감 파일이 커밋되지 않았는가
- [ ] `git status`가 깨끗한가
- [ ] push를 **하지 않았는가**

---

## 완료 보고 형식

```
✅ 커밋 완료

1. 🎨 styles: 경고 색상 토큰 추가
2. ✨ features/movies: 영화 목록 기능 추가
3. ✨ pages: 영화 목록 페이지 추가

복사분: (없으면 "없음")
- MovieCard ← GreetingCard (@duplicate-of 확인)

working tree: 깨끗함
push: 하지 않음
```
