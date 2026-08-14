/**
 * HTTP 클라이언트 — 공용 고정 구역 (복사 금지)
 *
 * 인증 토큰, 기본 URL, 에러 처리는 앱 전체에서 하나여야 합니다.
 * feature마다 fetch를 따로 만들면 로그아웃 처리나 토큰 갱신이
 * 어떤 화면에서만 동작하는 상황이 생깁니다.
 */
import type { ApiResponse } from '@/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export async function http<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new HttpError(response.status, `요청 실패: ${response.status}`)
  }

  const body = (await response.json()) as ApiResponse<T>
  return body.data
}
