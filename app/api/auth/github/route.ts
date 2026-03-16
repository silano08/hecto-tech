export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (!clientId) {
    return Response.json(
      { error: 'GITHUB_CLIENT_ID가 설정되지 않았습니다' },
      { status: 500 }
    )
  }

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/auth/github/callback`,
    scope: 'public_repo',
    state,
  })

  // state를 쿠키에 저장하여 callback에서 검증
  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  })
}
