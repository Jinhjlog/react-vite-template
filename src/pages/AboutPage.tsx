export function AboutPage() {
  return (
    <main className="grid gap-4">
      <h1 className="text-2xl font-semibold text-text-strong">소개</h1>
      <p>
        새 기능을 만들 때는{' '}
        <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">
          src/features/
        </code>{' '}
        아래에 폴더를 하나 만드는 것부터 시작하세요.
      </p>
    </main>
  )
}
