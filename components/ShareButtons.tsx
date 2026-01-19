'use client'

import { useState } from 'react'
import { Twitter, Linkedin, Link, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const shareToTwitter = () => {
    const url = getUrl()
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
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
      <button onClick={shareToTwitter} className={buttonClass} aria-label="Twitter에 공유">
        <Twitter size={18} />
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
