# syntax=docker/dockerfile:1
#
# React + Vite 정적 SPA 이미지 (멀티 스테이지)
#   1단계 builder — 의존성 설치 + 타입체크 + 번들
#   2단계 runner  — nginx 로 dist/ 만 서빙 (Node 런타임 없음)
#
# 빌드:  docker build -t react-vite-template .
# 실행:  docker run --rm -p 8080:80 react-vite-template
#
# ⚠️ Vite 환경변수(VITE_*)는 **빌드 시점에 번들 안으로 들어갑니다.**
#    컨테이너 실행 시 -e 로 넘겨도 반영되지 않습니다.
#    반드시 --build-arg 로 넘기세요. (Dokploy 는 Build Args 입력란 사용)
#      docker build --build-arg VITE_API_BASE_URL=https://api.example.com .

# ── 1단계: 빌드 ────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# 의존성만 먼저 복사 → 소스만 바뀌면 이 레이어는 캐시에서 재사용됩니다.
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사
COPY . .

# 빌드 시점 환경변수 (기본값 없음 = lib/http.ts 의 '/api' 폴백 사용)
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# tsc 타입체크 + vite 번들 → /app/dist
RUN npm run build

# ── 2단계: 서빙 ────────────────────────────────────
FROM nginx:1.29-alpine AS runner

# 기본 설정 대신 SPA 라우팅 폴백이 들어간 설정을 사용합니다.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물만 가져옵니다 (node_modules·소스 미포함)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Dokploy·compose 가 컨테이너 준비 상태를 판별할 수 있게 합니다.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --spider -q http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
