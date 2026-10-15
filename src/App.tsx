import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet, useSearchParams } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LazyAuthModal } from '@/components/sections/AuthModal'
import { ModalProvider, useModal } from '@/context/ModalContext'
import { AuthProvider } from '@/context/AuthContext'
import { UIProvider, useUI } from '@/context/UIContext'
import { MouseFollower } from '@/components/ui/MouseFollower'
import { PetalBackground } from '@/components/ui/PetalBackground'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LoadingState } from '@/components/ui/LoadingState'
import { ProfileOverlay } from '@/components/profile/ProfileOverlay'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAmbientMotion } from '@/hooks/useAmbientMotion'
// The landing page stays eager: it is the first paint for most visitors.
import { HomePage } from '@/pages/HomePage'

// ─── Lazy routes ──────────────────────────────────────────────────────────────
// Each page is its own chunk, fetched on first navigation.
const HiraganaPage      = lazy(() => import('@/pages/HiraganaPage').then(m => ({ default: m.HiraganaPage })))
const KanjiPage         = lazy(() => import('@/pages/KanjiPage').then(m => ({ default: m.KanjiPage })))
const QuizPage          = lazy(() => import('@/pages/QuizPage').then(m => ({ default: m.QuizPage })))
const ProfilePage       = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const GrammarPage       = lazy(() => import('@/pages/GrammarPage').then(m => ({ default: m.GrammarPage })))
const DashboardPage     = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AboutPage         = lazy(() => import('@/pages/AboutPage').then(m => ({ default: m.AboutPage })))
const TermsPage         = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })))
const PrivacyPage       = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const ServerErrorPage   = lazy(() => import('@/pages/ServerErrorPage').then(m => ({ default: m.ServerErrorPage })))
const ClassesPage       = lazy(() => import('@/pages/ClassesPage').then(m => ({ default: m.ClassesPage })))
const ClassDetailPage   = lazy(() => import('@/pages/ClassDetailPage').then(m => ({ default: m.ClassDetailPage })))
const VerifyEmailPage   = lazy(() => import('@/pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })))
const VerifyPendingPage = lazy(() => import('@/pages/VerifyPendingPage').then(m => ({ default: m.VerifyPendingPage })))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const OAuthCallbackPage = lazy(() => import('@/pages/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })))

// lottie-web + the koi JSON load only when this background is actually shown.
const KoiBackground = lazy(() => import('@/components/ui/KoiBackground').then(m => ({ default: m.KoiBackground })))

/** Suspense boundary for a lazy route: the shared skeleton while its chunk loads. */
function RouteSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState label="Loading page…" className="mx-auto max-w-3xl px-6 py-24" />}>
      {children}
    </Suspense>
  )
}

// ─── Ambient effects ──────────────────────────────────────────────────────────
// Decorative only: skipped entirely for reduced motion and touch devices.
function AmbientBackground() {
  const { backgroundAnimation } = useUI()
  const ambientMotion = useAmbientMotion()
  if (!ambientMotion) return null
  if (backgroundAnimation === 'petals') return <PetalBackground />
  if (backgroundAnimation === 'fish') {
    return (
      <Suspense fallback={null}>
        <KoiBackground />
      </Suspense>
    )
  }
  return null
}

function AmbientMouseFollower() {
  return useAmbientMotion() ? <MouseFollower /> : null
}

// ─── URL-triggered modal opener ───────────────────────────────────────────────
// Standalone pages link back to /?login=1, /?signup=1 or /?forgot=1 to open
// the auth popup (on its login, sign-up or forgot-password view) on the home page.
function ModalFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { openModal, openForgotPassword } = useModal()

  useEffect(() => {
    if (searchParams.get('login') === '1') {
      openModal('login')
      setSearchParams({}, { replace: true })
    } else if (searchParams.get('signup') === '1') {
      openModal('signup')
      setSearchParams({}, { replace: true })
    } else if (searchParams.get('forgot') === '1') {
      openForgotPassword()
      setSearchParams({}, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ─── Layout shell (shared Navbar + Footer + modals) ───────────────────────────
function Shell() {
  const { isProfileOverlayOpen, setIsProfileOverlayOpen } = useUI()

  return (
    <div className="bg-surface text-on-surface transition-colors duration-300 ease-in-out font-body selection:bg-primary-fixed selection:text-primary min-h-dvh flex flex-col relative overflow-x-hidden">
      <AmbientBackground />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <Navbar />
        <div className="flex-1">
          <ErrorBoundary>
            <ModalFromUrl />
            <RouteSuspense>
              <Outlet />
            </RouteSuspense>
          </ErrorBoundary>
        </div>
        <Footer />
        <LazyAuthModal />

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
    element: <RouteSuspense><VerifyEmailPage /></RouteSuspense>,
  },
  {
    // Forgot password runs inside the auth popup; keep this address working.
    path: 'forgot-password',
    element: <Navigate to="/?forgot=1" replace />,
  },
  {
    path: 'reset-password',
    element: <RouteSuspense><ResetPasswordPage /></RouteSuspense>,
  },
  {
    // Backend-owned Google OAuth returns a one-time code in this page's URL
    // fragment; the page exchanges it before creating the normal app session.
    path: 'auth/callback',
    element: <RouteSuspense><OAuthCallbackPage /></RouteSuspense>,
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
      {
        // Logged in but email not verified yet (auth guide §5)
        path: 'verify-email',
        element: <RequireAuth allowUnverified><VerifyPendingPage /></RequireAuth>,
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
            <AmbientMouseFollower />
            <RouterProvider router={router} />
            <Analytics />
            <SpeedInsights />
          </ModalProvider>
        </UIProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
