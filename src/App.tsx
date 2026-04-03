import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/sections/AuthModal'
import { ModalProvider } from '@/context/ModalContext'
import { AuthProvider } from '@/context/AuthContext'
import { UIProvider } from '@/context/UIContext'
import { MouseFollower } from '@/components/ui/MouseFollower'
import { HomePage } from '@/pages/HomePage'
import { HiraganaPage } from '@/pages/HiraganaPage'
import { KanjiPage } from '@/pages/KanjiPage'
import { QuizPage } from '@/pages/QuizPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ServerErrorPage } from '@/pages/ServerErrorPage'

// ─── Layout shell (shared Navbar + Footer + AuthModal) ────────────────────────
function Shell() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-primary min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <AuthModal />
    </div>
  )
}

// ─── Routes ───────────────────────────────────────────────────────────────────
// Add new pages here — services/mock data handle the data layer
const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'kana/hiragana', element: <HiraganaPage /> },
      { path: 'kana/kanji', element: <KanjiPage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '500', element: <ServerErrorPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <ModalProvider>
          <MouseFollower />
          <RouterProvider router={router} />
        </ModalProvider>
      </UIProvider>
    </AuthProvider>
  )
}
