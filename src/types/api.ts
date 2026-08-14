/**
 * 서버 응답 타입 — 공용 고정 구역 (복사 금지)
 *
 * 서버와의 계약(contract)은 하나뿐입니다.
 * 이걸 feature마다 복사하면, 서버가 필드를 바꿨을 때
 * 어떤 화면이 깨지는지 타입스크립트가 알려주지 못합니다.
 */

/** 모든 API 응답의 공통 봉투(envelope) */
export interface ApiResponse<T> {
  data: T
  message: string
}

/** 페이지네이션이 붙는 응답 */
export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
}
