import { QueryClient } from '@tanstack/react-query'

/**
 * 서버 상태 클라이언트 — 공용 고정 구역 (복사 금지)
 *
 * 캐시는 앱 전체에서 하나여야 합니다.
 * feature마다 QueryClient를 만들면 캐시가 갈라져서
 * 한쪽에서 수정한 데이터가 다른 화면에 반영되지 않습니다.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1분 안에 같은 데이터를 다시 요청하면 네트워크를 타지 않습니다.
      staleTime: 60_000,
      // 실패 시 1번만 재시도 (기본 3번은 에러 화면이 늦게 뜹니다)
      retry: 1,
      // 탭을 다시 켤 때마다 재요청하지 않습니다.
      refetchOnWindowFocus: false,
    },
  },
})
