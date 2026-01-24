import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = '헥토파이낸셜 기술 블로그'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo Symbol - Square H */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="6" fill="#FF6114" />
            <path d="M22.5 6H18.5V12.5H13.5V6H9.5V26H13.5V16.5H18.5V26H22.5V6Z" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span style={{ color: '#FF6114' }}>Hecto</span>
          <span>Tech Blog</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          핀테크 기술의 미래를 만들어갑니다
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: '#FF6114',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
