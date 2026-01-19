'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
          <h1 className="text-6xl font-bold text-[#ff6114] mb-4">오류</h1>
          <h2 className="text-2xl font-semibold mb-4">심각한 오류가 발생했습니다</h2>
          <p className="text-gray-500 mb-8">
            페이지를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={reset}
            className="bg-[#ff6114] text-white px-6 py-3 rounded-md font-medium hover:opacity-90"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
