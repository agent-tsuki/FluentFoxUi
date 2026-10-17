import { lazy, Suspense, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet, useSearchParams, type RouteObject } from 'react-router-dom'
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
// Ids and paths only (no course content), so the router stays light.
import { KANA_SCRIPT_IDS, kanaBasePath, type RegisteredKanaScriptId } from '@/lib/content/kana/scriptIds'
// The landing page stays eager: it is the first paint for most visitors.
import { HomePage } from '@/pages/HomePage'

// ─── Lazy routes ──────────────────────────────────────────────────────────────
// Each page is its own chunk, fetched on first navigation.
// The kana course engine (hiragana, katakana): one set of pages for every script.
const KanaScriptRoute   = lazy(() => import('@/pages/KanaScriptRoute').then(m => ({ default: m.KanaScriptRoute })))
const KanaCourseLayout  = lazy(() => import('@/pages/KanaCourseLayout').then(m => ({ default: m.KanaCourseLayout })))
const KanaCoursePage    = lazy(() => import('@/pages/KanaCoursePage').then(m => ({ default: m.KanaCoursePage })))
const KanaChartPage     = lazy(() => import('@/pages/KanaChartPage').then(m => ({ default: m.KanaChartPage })))
const KanaTestsPage     = lazy(() => import('@/pages/KanaTestsPage').then(m => ({ default: m.KanaTestsPage })))
const KanaDownloadsPage = lazy(() => import('@/pages/KanaDownloadsPage').then(m => ({ default: m.KanaDownloadsPage })))
const KanaPracticePage  = lazy(() => import('@/pages/KanaPracticePage').then(m => ({ default: m.KanaPracticePage })))
const KanaUnitPage      = lazy(() => import('@/pages/KanaUnitPage').then(m => ({ default: m.KanaUnitPage })))
const KanaUnitQuizPage  = lazy(() => import('@/pages/KanaUnitQuizPage').then(m => ({ default: m.KanaUnitQuizPage })))
const KanaFinalTestPage = lazy(() => import('@/pages/KanaFinalTestPage').then(m => ({ default: m.KanaFinalTestPage })))
const KanaSkipTestPage  = lazy(() => import('@/pages/KanaSkipTestPage').then(m => ({ default: m.KanaSkipTestPage })))
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

/**
 * Suspense for a kana course page chunk: only the page area shows the
 * skeleton, so the course header and sub-nav stay put while it loads.
 */
function CoursePageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState label="Loading page…" />}>{children}</Suspense>
}

// ─── Ambient effects ──────────────────────────────────────────────────────────
// Decorative only: skipped entirely for reduced motion and touch devices, and on
// the homepage, which is deliberately calm. Reads the router directly because the
// mouse follower renders outside <RouterProvider>.
const subscribeToRouter = (onChange: () => void) => router.subscribe(onChange)
const isOnHomePage = () => router.state.location.pathname === '/'

function AmbientBackground() {
  const { backgroundAnimation } = useUI()
  const ambientMotion = useAmbientMotion()
  const onHomePage = useSyncExternalStore(subscribeToRouter, isOnHomePage)
  if (!ambientMotion || onHomePage) return null
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
  const ambientMotion = useAmbientMotion()
  const onHomePage = useSyncExternalStore(subscribeToRouter, isOnHomePage)
  return ambientMotion && !onHomePage ? <MouseFollower /> : null
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
    <div className="bg-surface text-on-surface transition-colors duration-300 ease-in-out font-body selection:bg-primary-fixed selection:text-primary min-h-dvh flex flex-col relative overflow-x-clip">
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

/**
 * One kana script's route tree under /kana/<script>, built per registered
 * script (explicit paths, so /kana/kanji is never captured and unknown
 * scripts fall through to the 404). KanaScriptRoute provides the script config.
 */
function kanaCourseRoutes(script: RegisteredKanaScriptId): RouteObject {
  const base = kanaBasePath(script)
  return {
    path: base.slice(1),
    element: <KanaScriptRoute script={script} />,
    children: [
      {
        // Course · Chart · Tests · Downloads share one header, sub-nav and kana fetch.
        element: <KanaCourseLayout />,
        children: [
          { index: true,         element: <CoursePageSuspense><KanaCoursePage /></CoursePageSuspense> },
          { path: 'chart',       element: <CoursePageSuspense><KanaChartPage /></CoursePageSuspense> },
          { path: 'tests',       element: <CoursePageSuspense><KanaTestsPage /></CoursePageSuspense> },
          { path: 'downloads',   element: <CoursePageSuspense><KanaDownloadsPage /></CoursePageSuspense> },
        ],
      },
      { path: 'print',          element: <Navigate to={`${base}/downloads`} replace /> },
      { path: 'practice/:mode', element: <KanaPracticePage /> },
      { path: 'unit/:unitId',   element: <KanaUnitPage /> },
      { path: 'quiz/:unitId',   element: <KanaUnitQuizPage /> },
      { path: 'test',           element: <KanaFinalTestPage /> },
      { path: 'skip/:scope',    element: <KanaSkipTestPage /> },
    ],
  }
}

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
      ...KANA_SCRIPT_IDS.map(kanaCourseRoutes),
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
