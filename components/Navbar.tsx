import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="border-b border-border py-4 mb-8">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground">
          <span className="text-primary">Hecto Financial</span> Tech Blog
        </Link>

        <div className="flex gap-6 items-center">
          <Link href="/posts" className="text-foreground font-medium">
            Posts
          </Link>
          <Link
            href="https://www.hectofinancial.co.kr"
            target="_blank"
            className="text-white bg-primary px-4 py-2 rounded-md font-medium"
          >
            Hecto Financial
          </Link>
        </div>
      </nav>
    </header>
  )
}
