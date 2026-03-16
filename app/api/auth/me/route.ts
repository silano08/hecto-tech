import { getTokenFromCookie } from '@/lib/auth'

export async function GET(request: Request) {
  const token = getTokenFromCookie(request)

  if (!token) {
    return Response.json({ user: null }, { status: 401 })
  }

  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return Response.json({ user: null }, { status: 401 })
  }

  const user = await res.json()
  return Response.json({
    user: {
      login: user.login,
      name: user.name,
      avatar_url: user.avatar_url,
    },
  })
}
