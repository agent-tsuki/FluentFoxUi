import { lazy, Suspense, useEffect, useState } from 'react'
import { useModal } from '@/context/ModalContext'
import { authService } from '@/api/services/authService'

/**
 * Lazy entry point for the auth popup. The modal (forms, social buttons,
 * forgot-password flow) is its own chunk, fetched the first time the user
 * shows intent (hover/focus/touch on a Login or Sign Up button via
 * `authModalPrefetchHandlers`) or, at the latest, when it opens.
 */

let modalChunk: Promise<typeof import('./AuthModal')> | null = null

function loadAuthModal(): Promise<typeof import('./AuthModal')> {
  modalChunk ??= import('./AuthModal').catch((err: unknown) => {
    // Let a later attempt retry (e.g. after a flaky network).
    modalChunk = null
    throw err
  })
  return modalChunk
}

/** Start downloading the auth modal chunk. Safe to call repeatedly. */
export function prefetchAuthModal(): void {
  loadAuthModal().catch(() => { /* retried when the modal actually opens */ })
}

/** Spread onto any button that opens the auth modal, so its chunk is ready by the click. */
export const authModalPrefetchHandlers = {
  onPointerEnter: prefetchAuthModal,
  onFocus:        prefetchAuthModal,
  onTouchStart:   prefetchAuthModal,
} as const

const AuthModalChunk = lazy(() => loadAuthModal().then(m => ({ default: m.AuthModal })))

export function LazyAuthModal() {
  const { isOpen } = useModal()
  // Mount once first opened, then stay mounted (same behaviour as before lazy-loading).
  const [requested, setRequested] = useState(isOpen)
  if (isOpen && !requested) setRequested(true)

  // Wake the serverless API + database while the user is still typing.
  useEffect(() => {
    if (isOpen) authService.warmUp()
  }, [isOpen])

  if (!requested) return null
  return (
    <Suspense fallback={null}>
      <AuthModalChunk />
    </Suspense>
  )
}
