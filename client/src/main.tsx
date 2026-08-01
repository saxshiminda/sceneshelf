import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AuthLayout from './layouts/AuthLayout.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { ThemeProvider } from './theme/ThemeProvider.tsx'
import { ToastProvider } from './components/ToastProvider.tsx'
import HomePage from './pages/HomePage.tsx'
import SearchPage from './pages/SearchPage.tsx'
import MyShelf from './pages/MyShelf.tsx'
import TitlePage from './pages/TitlePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import SignupPage from './pages/SignupPage.tsx'
import AuthCallbackPage from './pages/AuthCallbackPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: 'home', element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'myshelf', element: <MyShelf /> },
      { path: 'title/:mediaType/:id', element: <TitlePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/settings', element: <Navigate to="/profile" replace /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
