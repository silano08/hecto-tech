'use client'

import { useState } from 'react'
import { Linkedin, Link, Check } from 'lucide-react'

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface ShareButtonsProps {
  title: string
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const shareToX = () => {
    const url = getUrl()
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const shareToLinkedIn = () => {
    const url = getUrl()
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  const copyLink = async () => {
    const url = getUrl()
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buttonClass = "p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors"

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted mr-1">공유</span>
      <button onClick={shareToX} className={buttonClass} aria-label="X에 공유">
        <XIcon size={18} />
      </button>
      <button onClick={shareToLinkedIn} className={buttonClass} aria-label="LinkedIn에 공유">
        <Linkedin size={18} />
      </button>
      <button onClick={copyLink} className={buttonClass} aria-label="링크 복사">
        {copied ? <Check size={18} className="text-green-500" /> : <Link size={18} />}
      </button>
    </div>
  )
}
