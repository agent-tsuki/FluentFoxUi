import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Lottie from 'lottie-react'
import koiAnimation from '@/assets/animations/koi_loader.json'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/sections/AuthModal'
import { ModalProvider } from '@/context/ModalContext'
import { AuthProvider } from '@/context/AuthContext'
import { UIProvider, useUI } from '@/context/UIContext'
import { MouseFollower } from '@/components/ui/MouseFollower'
import { ProfileOverlay } from '@/components/profile/ProfileOverlay'
import { HomePage } from '@/pages/HomePage'
import { HiraganaPage } from '@/pages/HiraganaPage'
import { KanjiPage } from '@/pages/KanjiPage'
import { QuizPage } from '@/pages/QuizPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ServerErrorPage } from '@/pages/ServerErrorPage'

// ─── Layout shell (shared Navbar + Footer + AuthModal) ────────────────────────
function Shell() {
  const { isProfileOverlayOpen, setIsProfileOverlayOpen } = useUI()

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-primary min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Global Background Animation Overlay Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08] flex items-center justify-center overflow-hidden">
        <div className="w-[1200px] h-[1200px] transform translate-y-32">
          <Lottie 
            animationData={koiAnimation} 
            loop={true} 
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
        <AuthModal />
        
        <ProfileOverlay 
          isOpen={isProfileOverlayOpen} 
          onClose={() => setIsProfileOverlayOpen(false)} 
        />
      </div>
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
