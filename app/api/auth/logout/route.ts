import { getTokenFromCookie } from '@/lib/auth'

export async function POST(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Origin 검증 (CSRF 방지)
  const origin = request.headers.get('origin')
  if (origin && origin !== siteUrl) {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }

  // GitHub 토큰 취소
  const token = getTokenFromCookie(request)
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET

  if (token && clientId && clientSecret) {
    try {
      await fetch(`https://api.github.com/applications/${clientId}/token`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({ access_token: token }),
      })
    } catch {
      // 토큰 취소 실패해도 쿠키는 삭제
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: siteUrl,
      'Set-Cookie': 'gh_token=; Path=/; HttpOnly; Max-Age=0',
    },
  })
}
