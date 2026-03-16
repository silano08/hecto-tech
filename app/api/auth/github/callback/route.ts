export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // state 검증 (CSRF 방지)
  const cookieHeader = request.headers.get('cookie') || ''
  const stateMatch = cookieHeader.match(/oauth_state=([^;]+)/)
  const storedState = stateMatch ? stateMatch[1] : null

  if (!state || !storedState || state !== storedState) {
    return Response.redirect(`${siteUrl}?error=invalid_state`)
  }

  if (!code) {
    return Response.redirect(`${siteUrl}?error=no_code`)
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const data = await tokenResponse.json()

  if (data.error || !data.access_token) {
    return Response.redirect(`${siteUrl}?error=auth_failed`)
  }

  const isSecure = url.protocol === 'https:'
  const tokenCookie = [
    `gh_token=${data.access_token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=86400',
    ...(isSecure ? ['Secure'] : []),
  ].join('; ')

  // state 쿠키 삭제 + 토큰 쿠키 설정
  const headers = new Headers()
  headers.append('Set-Cookie', tokenCookie)
  headers.append('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; Max-Age=0')
  headers.set('Location', `${siteUrl}/write`)

  return new Response(null, { status: 302, headers })
}
