import { Outlet } from 'react-router-dom'
import Logo from '../components/Logo'

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <header className="px-6 py-6 lg:px-10">
        <Logo size="md" />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
