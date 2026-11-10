import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'

type Variant = 'page' | 'panel' | 'inline'

const VARIANTS: Record<Variant, string> = {
  page: 'mx-auto max-w-md px-6 py-16 md:py-24',
  panel: 'rounded-xl bg-surface-sunken p-5',
  inline: '',
}

interface SignInPromptProps {
  /** 'page' replaces a whole route; 'panel' sits inline on a lesson page; 'inline' is one compact line (inside a tab). */
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
  if (variant === 'inline') {
    return (
      <section
        aria-label="Sign in to practise"
        className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md bg-surface-sunken px-4 py-3', className)}
      >
        <span aria-hidden className="flex">
          <Icon name="lock" className="text-xl text-primary" />
        </span>
        <p className="min-w-0 flex-1 basis-48 text-sm text-ink-muted">
          {unverified ? 'Verify your email to practise and save progress.' : 'Sign in to practise and save your progress.'}
        </p>
        {unverified ? (
          <Link to="/verify-email" className="text-sm font-bold text-primary underline-offset-4 hover:underline">
            Verify my email
          </Link>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openModal('login', { returnTo })} className="min-h-10 !px-4 !py-1.5 text-sm" {...authModalPrefetchHandlers}>
              Log in
            </Button>
            <Button variant="outline" onClick={() => openModal('signup', { returnTo })} className="min-h-10 !px-4 !py-1.5 text-sm" {...authModalPrefetchHandlers}>
              Sign up free
            </Button>
          </div>
        )}
      </section>
    )
  }
  return (
    <section
      aria-label="Sign in to practise"
      className={cn('flex flex-col items-center gap-3 text-center', VARIANTS[variant], className)}
    >
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon name="lock" className="text-2xl text-primary" />
      </span>
      <h2 className="font-display text-lg font-bold text-ink">
        {unverified ? 'Verify your email to practise' : 'Sign in to practise and save progress'}
      </h2>
      <p className="max-w-sm text-sm text-ink-muted">
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
export function LearnerOnly({ children, prompt = 'panel' }: { children: ReactNode; prompt?: Variant }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  return user?.emailVerified ? <>{children}</> : <SignInPrompt variant={prompt} />
}
