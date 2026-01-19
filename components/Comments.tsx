'use client'

import Giscus from '@giscus/react'

export default function Comments() {
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
      theme="preferred_color_scheme"
      lang="ko"
    />
  )
}
