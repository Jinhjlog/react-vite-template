import { Link, Outlet } from 'react-router-dom'

/** 모든 페이지를 감싸는 공통 레이아웃. */
export function RootLayout() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="flex gap-4 pb-6">
        <Link to="/" className="text-accent hover:underline">
          홈
        </Link>
        <Link to="/about" className="text-accent hover:underline">
          소개
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
