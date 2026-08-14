import { http } from '@/lib/http'
import type { Greeting } from '../types'

/**
 * feature의 API 계층.
 *
 * 공용 코드는 '@/lib/http' 처럼 별칭(@)으로 가져옵니다.
 * 같은 feature 안의 파일은 './' 또는 '../' 로 가져옵니다.
 */
export function getGreeting(id: string): Promise<Greeting> {
  return http<Greeting>(`/greetings/${id}`)
}
