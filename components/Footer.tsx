import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border py-6 lg:py-8 mt-12 lg:mt-16 text-center text-xs sm:text-sm text-muted">
      <span className="text-primary">Hecto Financial</span> | © {new Date().getFullYear()} All rights reserved. | <Link href="/rss.xml" className="hover:text-primary">RSS</Link>
    </footer>
  )
}
