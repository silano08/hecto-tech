import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import WriteButton from '@/components/editor/WriteButton'

export default function Navbar() {
  return (
    <header className="border-b border-border py-4 mb-6 lg:mb-8">
      <nav className="flex justify-between items-center gap-4">
        <Link href="/" className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
          <span className="text-primary">Hecto Financial</span> <span className="text-foreground">Tech Blog</span>
        </Link>

        <div className="flex items-center gap-2">
          <WriteButton />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
