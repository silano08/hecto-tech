'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">오류</h1>
      <h2 className="text-2xl font-semibold mb-4">문제가 발생했습니다</h2>
      <p className="text-muted mb-8">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <button
        onClick={reset}
        className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  )
}
