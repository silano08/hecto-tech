export default function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-16 text-center text-sm text-muted">
      <span className="text-primary">Hecto Financial</span> | © {new Date().getFullYear()} All rights reserved.
    </footer>
  )
}
