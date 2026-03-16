import { redirect } from 'next/navigation'
import { getTokenFromServerCookies } from '@/lib/auth'
import WriteEditor from './WriteEditor'

export const metadata = {
  title: '글쓰기',
}

export default async function WritePage() {
  const token = await getTokenFromServerCookies()

  if (!token) {
    redirect('/api/auth/github')
  }

  // 서버에서 사용자 정보 가져오기
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    redirect('/api/auth/github')
  }

  const user = await res.json()

  return (
    <WriteEditor
      user={{
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      }}
    />
  )
}
