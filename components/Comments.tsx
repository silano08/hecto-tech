'use client'

import Giscus from '@giscus/react'
import { useTheme } from 'next-themes'

export default function Comments() {
  const { resolvedTheme } = useTheme()

  return (
    <Giscus
      repo="soulee-dev/giscus-test"
      repoId="R_kgDOQ8yp5Q"
      category="Announcements"
      categoryId="DIC_kwDOQ8yp5c4C1JXF"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      lang="ko"
    />
  )
}
