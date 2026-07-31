import Header from './components/Header/Header'
import Footer from './components/Footer'
import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
