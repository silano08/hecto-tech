import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  return (
    <header className="border-b border-border py-4 mb-8">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground">
          <span className="text-primary">Hecto Financial</span> <span className="text-black dark:text-white">Tech Blog</span>
        </Link>

        <ThemeToggle />
      </nav>
    </header>
  )
}
