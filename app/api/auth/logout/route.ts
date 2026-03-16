export async function POST() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return new Response(null, {
    status: 302,
    headers: {
      Location: siteUrl,
      'Set-Cookie': 'gh_token=; Path=/; HttpOnly; Max-Age=0',
    },
  })
}
