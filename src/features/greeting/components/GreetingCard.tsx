import type { Greeting } from '../types'

interface GreetingCardProps {
  greeting: Greeting
}

/**
 * 이 feature 전용 컴포넌트입니다. (Presenter — props만 받습니다)
 *
 * 다른 feature에서 비슷한 카드가 필요하면 import하지 말고 복사하세요.
 * 복사할 때는 복사본 맨 위에 아래 주석을 남깁니다.
 *
 *   // @duplicate-of: src/features/greeting/components/GreetingCard.tsx
 */
export function GreetingCard({ greeting }: GreetingCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <p className="font-semibold text-text-strong">{greeting.message}</p>
      <p className="mt-1 text-sm text-text-muted">— {greeting.author}</p>
    </article>
  )
}
