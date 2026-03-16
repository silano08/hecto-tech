export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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

  const isProduction = process.env.NODE_ENV === 'production'
  const cookieFlags = [
    `gh_token=${data.access_token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=86400',
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${siteUrl}/write`,
      'Set-Cookie': cookieFlags,
    },
  })
}
