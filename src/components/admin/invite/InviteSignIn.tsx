import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useModal } from '@/context/ModalContext'
import { authService } from '@/api/services/authService'
import { authModalPrefetchHandlers } from '@/components/sections/AuthModal'

/**
 * Sign-in choices for a guest on an invite link. Every route comes back to
 * `returnTo` (this invite). X sign-in is deliberately not offered: X may not
 * share the email the invite was sent to.
 */
export function InviteSignIn({ returnTo, emailMasked }: { returnTo: string; emailMasked: string }) {
  const { openModal } = useModal()
  return (
    <div className="space-y-3">
      <p className="text-sm text-on-surface-variant">
        Sign in with <span className="font-semibold text-on-surface">{emailMasked}</span> to accept.
      </p>
      <Button type="button" variant="outline" className="flex min-h-11 w-full items-center justify-center gap-2 text-sm" onClick={() => authService.startGoogleOAuth(returnTo)}>
        <Icon name="account_circle" className="text-lg" />
        Continue with Google
      </Button>
      <Button type="button" className="min-h-11 w-full text-sm" onClick={() => openModal('login', { returnTo })} {...authModalPrefetchHandlers}>
        Sign in with email
      </Button>
      <Button type="button" variant="ghost" className="min-h-11 w-full text-sm" onClick={() => openModal('signup', { returnTo })} {...authModalPrefetchHandlers}>
        Create an account
      </Button>
    </div>
  )
}
