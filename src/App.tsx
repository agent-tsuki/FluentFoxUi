import { lazy, Suspense, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Outlet, useSearchParams, type RouteObject } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { PathUserSync } from '@/components/auth/PathUserSync'
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
import { DEFAULT_KANJI_LEVEL, KANJI_LAST_LEVEL_KEY, KANJI_LEVELS, isKanjiLevelAvailable, isKanjiLevelId, kanjiLevelPath, type KanjiLevelMeta } from '@/lib/content/kanji/levels'
// The landing page stays eager: it is the first paint for most visitors.
import { HomePage } from '@/pages/HomePage'
import { KANJI_TRACK, reviewPath } from '@/lib/learn/paths'

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
// The kanji course: one set of pages for every JLPT level with data.
const KanjiLevelRoute        = lazy(() => import('@/pages/KanjiLevelRoute').then(m => ({ default: m.KanjiLevelRoute })))
const KanjiCourseLayout      = lazy(() => import('@/pages/KanjiCourseLayout').then(m => ({ default: m.KanjiCourseLayout })))
const KanjiCoursePage        = lazy(() => import('@/pages/KanjiCoursePage').then(m => ({ default: m.KanjiCoursePage })))
const KanjiReviewsPage       = lazy(() => import('@/pages/KanjiReviewsPage').then(m => ({ default: m.KanjiReviewsPage })))
const KanjiBrowsePage        = lazy(() => import('@/pages/KanjiBrowsePage').then(m => ({ default: m.KanjiBrowsePage })))
const KanjiTestsPage         = lazy(() => import('@/pages/KanjiTestsPage').then(m => ({ default: m.KanjiTestsPage })))
const KanjiDownloadsPage     = lazy(() => import('@/pages/KanjiDownloadsPage').then(m => ({ default: m.KanjiDownloadsPage })))
const KanjiUnitPage          = lazy(() => import('@/pages/KanjiUnitPage').then(m => ({ default: m.KanjiUnitPage })))
const KanjiUnitQuizPage      = lazy(() => import('@/pages/KanjiUnitQuizPage').then(m => ({ default: m.KanjiUnitQuizPage })))
const KanjiPracticePage      = lazy(() => import('@/pages/KanjiPracticePage').then(m => ({ default: m.KanjiPracticePage })))
const KanjiSkipTestPage      = lazy(() => import('@/pages/KanjiTestPages').then(m => ({ default: m.KanjiSkipTestPage })))
const KanjiLevelTestPage     = lazy(() => import('@/pages/KanjiTestPages').then(m => ({ default: m.KanjiLevelTestPage })))
const KanjiDetailPage        = lazy(() => import('@/pages/KanjiDetailPage').then(m => ({ default: m.KanjiDetailPage })))
const KanjiComingSoonPage    = lazy(() => import('@/pages/KanjiComingSoonPage').then(m => ({ default: m.KanjiComingSoonPage })))
const LearnLessonPage   = lazy(() => import('@/pages/LearnLessonPage').then(m => ({ default: m.LearnLessonPage })))
const ReviewPage        = lazy(() => import('@/pages/ReviewPage').then(m => ({ default: m.ReviewPage })))
const HowGradingWorksPage = lazy(() => import('@/pages/HowGradingWorksPage').then(m => ({ default: m.HowGradingWorksPage })))
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

// Guests may browse charts, unit pages and kanji pages. Every quiz, test,
// practice and review route needs a signed-in, verified user (RequireAuth),
// because answers are graded and stored on the server.

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
      { path: 'practice/:mode', element: <RequireAuth guestPrompt><KanaPracticePage /></RequireAuth> },
      { path: 'unit/:unitId',   element: <KanaUnitPage /> },
      { path: 'quiz/:unitId',   element: <RequireAuth guestPrompt><KanaUnitQuizPage /></RequireAuth> },
      { path: 'test',           element: <RequireAuth guestPrompt><KanaFinalTestPage /></RequireAuth> },
      { path: 'skip/:scope',    element: <RequireAuth guestPrompt><KanaSkipTestPage /></RequireAuth> },
    ],
  }
}

/**
 * One kanji level's route tree under /kanji/<level>. Levels with data get the
 * full course; coming-soon levels (N3–N1 until the API serves them) get a
 * placeholder for every path below them.
 */
function kanjiLevelRoutes(level: KanjiLevelMeta): RouteObject {
  const base = kanjiLevelPath(level.id)
  if (!isKanjiLevelAvailable(level.id)) {
    return { path: `${base.slice(1)}/*`, element: <KanjiComingSoonPage level={level.id} /> }
  }
  return {
    path: base.slice(1),
    element: <KanjiLevelRoute level={level.id} />,
    children: [
      {
        // Course · Reviews · Browse · Tests · Downloads share one header, sub-nav and index fetch.
        element: <KanjiCourseLayout />,
        children: [
          { index: true,         element: <CoursePageSuspense><KanjiCoursePage /></CoursePageSuspense> },
          { path: 'reviews',     element: <CoursePageSuspense><RequireAuth guestPrompt="inline"><KanjiReviewsPage /></RequireAuth></CoursePageSuspense> },
          { path: 'browse',      element: <CoursePageSuspense><KanjiBrowsePage /></CoursePageSuspense> },
          { path: 'tests',       element: <CoursePageSuspense><KanjiTestsPage /></CoursePageSuspense> },
          { path: 'downloads',   element: <CoursePageSuspense><KanjiDownloadsPage /></CoursePageSuspense> },
        ],
      },
      { path: 'unit/:unitId',   element: <KanjiUnitPage /> },
      { path: 'quiz/:unitId',   element: <RequireAuth guestPrompt><KanjiUnitQuizPage /></RequireAuth> },
      { path: 'practice/:mode', element: <RequireAuth guestPrompt><KanjiPracticePage /></RequireAuth> },
      { path: 'skip/:scope',    element: <RequireAuth guestPrompt><KanjiSkipTestPage /></RequireAuth> },
      { path: 'test',           element: <RequireAuth guestPrompt><KanjiLevelTestPage /></RequireAuth> },
      { path: '*',              element: <Navigate to={base} replace /> },
    ],
  }
}

/** /kanji → the last level visited (or N5). */
function KanjiIndexRedirect() {
  let level: string | null = null
  try {
    level = localStorage.getItem(KANJI_LAST_LEVEL_KEY)
  } catch {
    /* storage blocked */
  }
  return <Navigate to={kanjiLevelPath(isKanjiLevelId(level ?? undefined) ? (level as KanjiLevelMeta['id']) : DEFAULT_KANJI_LEVEL)} replace />
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
      // The old kanji chart lived here; the kanji course replaced it.
      { path: 'kana/kanji',      element: <Navigate to={kanjiLevelPath(DEFAULT_KANJI_LEVEL)} replace /> },
      { path: 'kanji',           element: <KanjiIndexRedirect /> },
      ...KANJI_LEVELS.map(kanjiLevelRoutes),
      // The old local review runner; reviews now run on the learn API.
      { path: 'kanji/reviews/session', element: <Navigate to={reviewPath(KANJI_TRACK)} replace /> },
      // Lessons and reviews on the learn API (graded and scheduled by the server).
      { path: 'learn/lesson/:track', element: <RequireAuth guestPrompt><LearnLessonPage /></RequireAuth> },
      { path: 'learn/how-grading-works', element: <HowGradingWorksPage /> },
      { path: 'review',          element: <RequireAuth guestPrompt><ReviewPage /></RequireAuth> },
      // /kanji/日 (validated inside: anything that isn't one kanji is a 404).
      { path: 'kanji/:char',     element: <KanjiDetailPage /> },
      { path: 'grammar/:level/:chapterId?',  element: <GrammarPage /> },
      { path: 'quiz',            element: <RequireAuth guestPrompt><QuizPage /></RequireAuth> },
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
      { path: 'settings/learning', element: <Navigate to="/profile?tab=learning" replace /> },
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
            <PathUserSync />
            <RouterProvider router={router} />
            <Analytics />
            <SpeedInsights />
          </ModalProvider>
        </UIProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
