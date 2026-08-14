import { GreetingCard } from '@/features/greeting/components/GreetingCard'
import type { Greeting } from '@/features/greeting/types'

/**
 * 페이지는 feature들을 "조합"하는 자리입니다. (Container)
 *
 * feature끼리는 서로 import할 수 없지만, 페이지는 여러 feature를
 * 자유롭게 가져다 쓸 수 있습니다. 두 기능을 붙여야 한다면 그 일은
 * 항상 여기서 일어납니다.
 *
 * 서버에서 데이터를 가져올 때도 호출은 여기서 하고, 결과를 props로
 * 컴포넌트에 내려줍니다. (AGENTS.md §1.4)
 */
const SAMPLE: Greeting = {
  id: '1',
  message: '이 프로젝트는 feature 단위로 나뉘어 있습니다.',
  author: 'docs/ARCHITECTURE.md',
}

export function HomePage() {
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-semibold text-text-strong">홈</h1>
      <GreetingCard greeting={SAMPLE} />
    </main>
  )
}
