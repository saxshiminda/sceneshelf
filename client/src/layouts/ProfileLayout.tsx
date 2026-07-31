import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import RequireAuth from '../components/RequireAuth'
import { UserCircleIcon } from '@heroicons/react/24/outline'

const tabs = [
  { to: '/profile', label: 'Overview', end: true },
  { to: '/profile/settings', label: 'Settings', end: false },
]

export default function ProfileLayout() {
  const { user, avatarUrl } = useAuth()
  const displayName = user?.name?.trim() || user?.tmdb_username || 'Profile'

  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="size-20 rounded-full object-cover ring-1 ring-border sm:size-24"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-elevated ring-1 ring-border sm:size-24">
              <UserCircleIcon className="size-12 text-fg-muted" />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl text-fg sm:text-4xl">{displayName}</h1>
            {user?.tmdb_username ? (
              <p className="mt-1 text-sm text-fg-muted">@{user.tmdb_username}</p>
            ) : user?.email && !user.email.endsWith('@tmdb.sceneshelf.local') ? (
              <p className="mt-1 text-sm text-fg-muted">{user.email}</p>
            ) : null}
          </div>
        </div>

        <nav
          aria-label="Profile"
          className="mt-10 flex flex-wrap gap-2 border-b border-border pb-px"
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-brass text-fg'
                    : 'border-transparent text-fg-muted hover:text-fg-secondary'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </RequireAuth>
  )
}
