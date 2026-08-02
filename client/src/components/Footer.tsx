import { Link } from 'react-router-dom'
import Logo from './Logo'

const links = [
  { name: 'Discover', href: '/home' },
  { name: 'Search', href: '/search' },
  { name: 'My Shelf', href: '/myshelf' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:flex-row sm:items-start sm:justify-between lg:px-8">
        <div className="max-w-xs">
          <Logo size="md" />
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            Your private cinema shelf.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm text-fg-secondary transition hover:text-brass"
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/profile"
            className="text-sm text-fg-secondary transition hover:text-brass"
          >
            Profile
          </Link>
        </nav>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-fg-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {year} SceneShelf</p>
          <p>
            This product uses the{' '}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
              className="text-fg-secondary transition hover:text-brass"
            >
              TMDB
            </a>{' '}
            API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  )
}
