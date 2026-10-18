import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'

type Variant = 'page' | 'panel'

const VARIANTS: Record<Variant, string> = {
  page: 'mx-auto max-w-md px-6 py-16 md:py-24',
  panel: 'rounded-2xl bg-surface-container-low p-5',
}

interface SignInPromptProps {
  /** 'page' replaces a whole route; 'panel' sits inline on a lesson page. */
  variant?: Variant
  className?: string
}

/**
 * "Sign in to practise and save progress": shown to guests instead of a
 * quiz, test, practice, lesson check or review, which are graded and stored
 * on the server. Signed-in users who have not verified their email get a
 * link to do that instead.
 */
export function SignInPrompt({ variant = 'panel', className }: SignInPromptProps) {
  const { user } = useAuth()
  const { openModal } = useModal()
  const { pathname, search, hash } = useLocation()
  const unverified = Boolean(user && !user.emailVerified)
  const returnTo = `${pathname}${search}${hash}`
  return (
    <section
      aria-label="Sign in to practise"
      className={cn('flex flex-col items-center gap-3 text-center', VARIANTS[variant], className)}
    >
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon name="lock" className="text-2xl text-primary" />
      </span>
      <h2 className="font-headline text-lg font-bold text-on-surface">
        {unverified ? 'Verify your email to practise' : 'Sign in to practise and save progress'}
      </h2>
      <p className="max-w-sm text-sm text-on-surface-variant">
        {unverified
          ? 'Quizzes, practice and reviews are saved to your account once your email is verified.'
          : 'Reading lessons and charts is free. Quizzes, practice and reviews are graded and saved to your account.'}
      </p>
      {unverified ? (
        <Link to="/verify-email" className="text-sm font-bold text-primary underline-offset-4 hover:underline">
          Verify my email
        </Link>
      ) : (
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button onClick={() => openModal('login', { returnTo })} className="min-h-11" {...authModalPrefetchHandlers}>
            Log in
          </Button>
          <Button variant="outline" onClick={() => openModal('signup', { returnTo })} className="min-h-11" {...authModalPrefetchHandlers}>
            Sign up free
          </Button>
        </div>
      )}
    </section>
  )
}

/** Renders `children` for verified learners and the sign-in prompt for everyone else. */
export function LearnerOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user?.emailVerified ? <>{children}</> : <SignInPrompt />
}
