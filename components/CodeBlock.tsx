'use client'

import { useRef, type ComponentPropsWithoutRef } from 'react'
import CopyButton from '@/components/CopyButton'

export default function CodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)

  const getCodeText = () => {
    return preRef.current?.textContent ?? ''
  }

  return (
    <div className="relative group">
      <pre ref={preRef} {...props} />
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton getText={getCodeText} />
      </div>
    </div>
  )
}
