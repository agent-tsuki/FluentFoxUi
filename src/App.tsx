import { useEffect, useRef } from 'react'
import { createBrowserRouter, RouterProvider, Outlet, useSearchParams } from 'react-router-dom'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'
import koiAnimation from '@/assets/animations/koi_loader.json'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/sections/AuthModal'
import { ModalProvider, useModal } from '@/context/ModalContext'
import { AuthProvider } from '@/context/AuthContext'
import { UIProvider, useUI } from '@/context/UIContext'
import { MouseFollower } from '@/components/ui/MouseFollower'
import { PetalBackground } from '@/components/ui/PetalBackground'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ProfileOverlay } from '@/components/profile/ProfileOverlay'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { HomePage } from '@/pages/HomePage'
import { HiraganaPage } from '@/pages/HiraganaPage'
import { KanjiPage } from '@/pages/KanjiPage'
import { QuizPage } from '@/pages/QuizPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { GrammarPage } from '@/pages/GrammarPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AboutPage } from '@/pages/AboutPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ServerErrorPage } from '@/pages/ServerErrorPage'
import { ClassesPage } from '@/pages/ClassesPage'
import { ClassDetailPage } from '@/pages/ClassDetailPage'
import { VerifyEmailPage } from '@/pages/VerifyEmailPage'

// ─── Koi fish background — pauses when tab is hidden ──────────────────────────
function KoiBackground() {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const { darkMode } = useUI()

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        lottieRef.current?.pause()
      } else {
        lottieRef.current?.play()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden transition-opacity duration-500"
      style={{ opacity: darkMode ? 0.18 : 0.08, zIndex: 0 }}
    >
      <div className="w-[1200px] h-[1200px] transform translate-y-32">
        <Lottie
          lottieRef={lottieRef}
          animationData={koiAnimation}
          loop
          className="w-full h-full"
        />
      </div>
    </div>
  )
}

// ─── URL-triggered modal opener ───────────────────────────────────────────────
// The VerifyEmailPage links back to /?login=1 or /?signup=1 to open the modal
// on the home page without a separate login route.
function ModalFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { openModal } = useModal()

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      openModal('login')
      setSearchParams({}, { replace: true })
    } else if (searchParams.get('signup') === '1') {
      openModal('signup')
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ─── Layout shell (shared Navbar + Footer + modals) ───────────────────────────
function Shell() {
  const { isProfileOverlayOpen, setIsProfileOverlayOpen, backgroundAnimation } = useUI()

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-fixed selection:text-primary min-h-screen flex flex-col relative overflow-x-hidden">
      {backgroundAnimation === 'petals' && <PetalBackground />}
      {backgroundAnimation === 'fish'   && <KoiBackground />}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <ErrorBoundary>
            <ModalFromUrl />
            <Outlet />
          </ErrorBoundary>
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
const router = createBrowserRouter([
  {
    // /verify is outside Shell — it has its own minimal layout
    path: 'verify',
    element: <VerifyEmailPage />,
  },
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true,              element: <HomePage /> },
      { path: 'kana/hiragana',   element: <HiraganaPage /> },
      { path: 'kana/kanji',      element: <KanjiPage /> },
      { path: 'grammar/:level/:chapterId?',  element: <GrammarPage /> },
      { path: 'quiz',            element: <QuizPage /> },
      { path: 'classes',         element: <ClassesPage /> },
      { path: 'classes/:teacherId', element: <ClassDetailPage /> },
      { path: 'about',           element: <AboutPage /> },
      { path: 'terms',           element: <TermsPage /> },
      { path: 'privacy',         element: <PrivacyPage /> },
      { path: '500',             element: <ServerErrorPage /> },

      // ── Protected routes ─────────────────────────────────────────────────
      {
        path: 'dashboard',
        element: <RequireAuth><DashboardPage /></RequireAuth>,
      },
      {
        path: 'profile',
        element: <RequireAuth><ProfilePage /></RequireAuth>,
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UIProvider>
          <ModalProvider>
            <MouseFollower />
            <RouterProvider router={router} />
          </ModalProvider>
        </UIProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
