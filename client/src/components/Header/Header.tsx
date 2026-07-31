import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, MoonIcon, SunIcon, UserCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import type { Navigation } from '../../interfaces/Navigation'
import { useTheme } from '../../theme/ThemeProvider'
import { useAuth } from '../../auth/AuthProvider'

const navigation: Navigation[] = [
  { name: 'Discover', href: '/home' },
  { name: 'Search', href: '/search' },
  { name: 'My Shelf', href: '/myshelf' },
]

function AvatarButton({ avatarUrl, className }: { avatarUrl: string | null; className?: string }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`size-8 rounded-full object-cover ring-1 ring-border ${className ?? ''}`}
      />
    )
  }
  return <UserCircleIcon className={`size-7 text-fg-secondary ${className ?? ''}`} />
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { avatarUrl, isAuthenticated, logout } = useAuth()

  async function onLogout() {
    await logout()
    navigate('/home', { replace: true })
  }

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
              <Menu as="div" className="relative hidden sm:block">
                <MenuButton
                  className="rounded-full p-0.5 transition hover:bg-elevated"
                  aria-label="Account menu"
                >
                  <AvatarButton avatarUrl={avatarUrl} />
                </MenuButton>
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="z-50 mt-2 w-44 origin-top-right rounded-md border border-border bg-surface py-1 shadow-lg outline-none transition data-closed:scale-95 data-closed:opacity-0"
                >
                  <MenuItem>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 text-sm text-fg data-focus:bg-elevated"
                    >
                      Profile
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link
                      to="/profile/settings"
                      className="block px-3 py-2 text-sm text-fg data-focus:bg-elevated"
                    >
                      Settings
                    </Link>
                  </MenuItem>
                  <div className="my-1 border-t border-border" />
                  <MenuItem>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="block w-full px-3 py-2 text-left text-sm text-fg data-focus:bg-elevated data-focus:text-red-400"
                    >
                      Log out
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
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
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await onLogout()
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-base text-fg hover:bg-elevated hover:text-red-400"
                >
                  Log out
                </button>
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
