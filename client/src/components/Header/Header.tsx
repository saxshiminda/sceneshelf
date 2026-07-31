import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, MoonIcon, SunIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Navigation } from '../../interfaces/Navigation'
import { useTheme } from '../../theme/ThemeProvider'
import { useAuth } from '../../auth/AuthProvider'

const navigation: Navigation[] = [
  { name: 'Discover', href: '/home' },
  { name: 'Search', href: '/search' },
  { name: 'My Shelf', href: '/myshelf' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur-md">
        <nav
          aria-label="Global"
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8"
        >
          <Link
            to="/home"
            className="font-display text-xl text-fg transition hover:text-brass"
          >
            SceneShelf
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm transition ${
                    active
                      ? 'font-medium text-fg'
                      : 'text-fg-secondary hover:text-fg'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full p-2 text-fg-secondary transition hover:bg-elevated hover:text-fg"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="size-5" />
              ) : (
                <MoonIcon className="size-5" />
              )}
            </button>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full py-1 pr-1 pl-2 transition hover:bg-elevated sm:flex"
                aria-label="Profile"
              >
                <span className="max-w-[8rem] truncate text-sm text-fg-secondary">
                  {user?.name}
                </span>
                <UserCircleIcon className="size-7 text-fg-secondary" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-full p-1.5 text-fg-secondary transition hover:bg-elevated hover:text-fg"
                aria-label="Account"
              >
                <UserCircleIcon className="size-7" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-fg md:hidden"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="size-6" />
            </button>
          </div>
        </nav>
      </header>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="md:hidden">
        <div className="fixed inset-0 z-50 bg-canvas/60" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-surface p-6 sm:max-w-sm sm:ring-1 sm:ring-border">
          <div className="flex items-center justify-between">
            <Link
              to="/home"
              className="font-display text-xl text-fg"
              onClick={() => setMobileMenuOpen(false)}
            >
              SceneShelf
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-fg"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <div className="mt-8 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base text-fg hover:bg-elevated"
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base text-fg hover:bg-elevated"
                >
                  Profile
                </Link>
                <Link
                  to="/profile/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base text-fg hover:bg-elevated"
                >
                  Settings
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base text-fg hover:bg-elevated"
              >
                Log in
              </Link>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}
