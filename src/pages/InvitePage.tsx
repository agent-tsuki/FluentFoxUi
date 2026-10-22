import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { InviteSummary } from '@/components/admin/invite/InviteSummary'
import { InviteSignIn } from '@/components/admin/invite/InviteSignIn'
import { useAuth } from '@/context/AuthContext'
import { useInvitePreview } from '@/hooks/admin/useAdminData'
import { inviteService } from '@/api/services/inviteService'
import { adminService } from '@/api/services/adminService'
import { hasErrorCode, resolveErrorMessage } from '@/api/errors'
import type { InviteStatus } from '@/types/admin'

const CLOSED: Record<Exclude<InviteStatus, 'pending'>, { title: string; text: string }> = {
  accepted: { title: 'This invite was already used', text: 'Each invite works once. If it was yours, open the admin area from your account menu.' },
  expired:  { title: 'This invite has expired',      text: 'Invites last 7 days. Ask the person who invited you to send a new one.' },
  revoked:  { title: 'This invite was cancelled',    text: 'Ask the person who invited you for a new invite.' },
}

type AcceptFailure = { kind: 'mismatch' } | { kind: 'closed'; status: Exclude<InviteStatus, 'pending'> } | { kind: 'other'; message: string }

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-lg space-y-6 px-4 pb-24 pt-nav text-center sm:px-6"><div className="h-6" />{children}</main>
}

/** /invite/:token — preview a teacher invite, sign in with the invited email, accept. */
export function InvitePage() {
  const { token = '' } = useParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isLoading: authLoading, logout } = useAuth()
  const preview = useInvitePreview(token)
  const [accepting, setAccepting] = useState(false)
  const [failure, setFailure] = useState<AcceptFailure | null>(null)

  if (preview.isLoading || authLoading) return <Shell><LoadingState label="Loading invite…" /></Shell>
  if (preview.error) {
    return hasErrorCode(preview.error, 'INVITE_NOT_FOUND', 'RESOURCE_NOT_FOUND')
      ? <Shell><ErrorState title="Invite not found" message="This link isn't valid. Check you copied the whole link from the email, or ask for a new invite." /></Shell>
      : <Shell><ErrorState message={resolveErrorMessage(preview.error)} onRetry={preview.refetch} /></Shell>
  }
  const invite = preview.data
  if (!invite) return null

  const closed = failure?.kind === 'closed' ? failure.status : invite.status !== 'pending' ? invite.status : null
  if (closed) return <Shell><ErrorState title={CLOSED[closed].title} message={CLOSED[closed].text} /></Shell>

  const accept = async () => {
    setAccepting(true)
    setFailure(null)
    try {
      await inviteService.acceptInvite(token)
      adminService.clearMyPermissions()
      navigate('/admin/my-channels', { replace: true })
    } catch (err: unknown) {
      if (hasErrorCode(err, 'INVITE_EMAIL_MISMATCH')) setFailure({ kind: 'mismatch' })
      else if (hasErrorCode(err, 'INVITE_USED')) setFailure({ kind: 'closed', status: 'accepted' })
      else if (hasErrorCode(err, 'INVITE_EXPIRED')) setFailure({ kind: 'closed', status: 'expired' })
      else if (hasErrorCode(err, 'INVITE_REVOKED')) setFailure({ kind: 'closed', status: 'revoked' })
      else setFailure({ kind: 'other', message: resolveErrorMessage(err) })
      setAccepting(false)
    }
  }

  return (
    <Shell>
      <header className="space-y-2">
        <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon name="mail" className="text-2xl text-primary" />
        </span>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">You&apos;re invited to teach on FoxSensei</h1>
        <p className="text-sm text-on-surface-variant">Accept to manage your channel&apos;s profile and courses.</p>
      </header>
      <InviteSummary preview={invite} />

      {!user ? (
        <InviteSignIn returnTo={pathname} emailMasked={invite.emailMasked} />
      ) : !user.emailVerified ? (
        <StatusMessage tone="info" message="Verify your email address first, then come back to this link." />
      ) : failure?.kind === 'mismatch' ? (
        <div className="space-y-3">
          <StatusMessage tone="error" message={`This invite is for ${invite.emailMasked}, but you're signed in as ${user.email}. Sign out, then sign in with ${invite.emailMasked}.`} />
          <Button type="button" variant="outline" className="min-h-11 w-full text-sm" onClick={() => { setFailure(null); logout() }}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {failure?.kind === 'other' && <StatusMessage tone="error" message={failure.message} />}
          <p className="text-sm text-on-surface-variant">Signed in as <span className="font-semibold text-on-surface">{user.email}</span></p>
          <Button type="button" className="min-h-11 w-full text-sm" disabled={accepting} onClick={() => void accept()}>
            {accepting ? 'Accepting…' : 'Accept invite'}
          </Button>
        </div>
      )}
      {user && !user.emailVerified && (
        <Link to={`/verify-email?returnTo=${encodeURIComponent(pathname)}`} className="inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline">
          Verify my email
        </Link>
      )}
    </Shell>
  )
}
