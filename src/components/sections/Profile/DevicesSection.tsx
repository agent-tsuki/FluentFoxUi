import { useCallback, useEffect, useState } from 'react'
import type { DeviceSession } from '@/types'
import { profileService } from '@/api/services/profileService'
import { resolveErrorMessage } from '@/api/errors'
import { deviceIcon, deviceName, devicePlace } from '@/lib/profile/deviceLabel'
import { timeAgo } from '@/lib/profile/formatTime'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { LoginMap } from './LoginMap'
import { LocationAccess } from './LocationAccess'

type Status = 'loading' | 'error' | 'ready'

/** Signed-in devices: where and when each one logged in, with sign-out. */
export function DevicesSection() {
  const [sessions, setSessions] = useState<DeviceSession[]>([])
  const [status, setStatus]     = useState<Status>('loading')
  const [busy, setBusy]         = useState<string | null>(null)
  const [message, setMessage]   = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const load = useCallback(() => {
    profileService.listSessions()
      .then(list => { setSessions(list); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(load, [load])

  const act = async (key: string, action: () => Promise<string>) => {
    setBusy(key)
    setMessage(null)
    try {
      setMessage({ tone: 'success', text: await action() })
      load()
    } catch (err) {
      setMessage({ tone: 'error', text: resolveErrorMessage(err) })
    } finally {
      setBusy(null)
    }
  }

  const revoke = (id: string) => act(id, async () => {
    await profileService.revokeSession(id)
    return 'That device is signed out. It loses access within a few minutes.'
  })

  const revokeOthers = () => act('others', async () => {
    const count = await profileService.revokeOtherSessions()
    return count === 0 ? 'No other devices were signed in.' : `Signed out ${count} other device${count === 1 ? '' : 's'}.`
  })

  const others = sessions.filter(s => !s.isCurrent).length

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-on-surface font-headline">Devices &amp; login locations</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Every device signed in to your account, and where it logged in from
          </p>
        </div>
        {others > 0 && (
          <Button variant="outline" className="text-sm px-4 py-2" onClick={revokeOthers} disabled={busy !== null}>
            {busy === 'others' ? 'Signing out…' : 'Sign out all other devices'}
          </Button>
        )}
      </div>

      <div className="px-8 py-6 space-y-6">
        <LocationAccess onSaved={load} />

        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={`text-xs font-body ${message.tone === 'error' ? 'text-error' : 'text-tertiary'}`}>
            {message.text}
          </p>
        )}

        {status === 'loading' && <p className="text-sm text-on-surface-variant">Loading devices…</p>}
        {status === 'error' && (
          <p className="text-sm text-error">
            We couldn&apos;t load your devices. <button type="button" onClick={load} className="font-semibold underline">Try again</button>
          </p>
        )}
        {status === 'ready' && sessions.map(session => (
          <DeviceRow key={session.id} session={session} busy={busy === session.id} disabled={busy !== null} onRevoke={() => revoke(session.id)} />
        ))}
      </div>
    </div>
  )
}

interface DeviceRowProps {
  session:  DeviceSession
  busy:     boolean
  disabled: boolean
  onRevoke: () => void
}

function DeviceRow({ session, busy, disabled, onRevoke }: DeviceRowProps) {
  const place = devicePlace(session)
  const { latitude, longitude, source } = session.location
  const precise = source === 'gps'

  return (
    <div className="rounded-xl border border-outline-variant/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant shrink-0">
            <Icon name={deviceIcon(session)} className="text-xl" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-on-surface">
              {deviceName(session)}
              {session.isCurrent && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-bold uppercase text-primary">This device</span>}
            </p>
            <p className="text-xs text-on-surface-variant">
              Logged in {timeAgo(session.createdAt)} · active {timeAgo(session.lastUsedAt)}
            </p>
            <p className="text-xs text-on-surface-variant">
              {place || 'Location unknown'}
              {place && <> · {precise ? `GPS, within ${session.location.accuracyM ?? '?'} m` : 'approximate (from IP)'}</>}
              {session.ipApprox && <> · IP {session.ipApprox}</>}
            </p>
          </div>
        </div>
        {!session.isCurrent && (
          <Button variant="ghost" className="text-sm px-3 py-1.5 text-error" onClick={onRevoke} disabled={disabled}>
            {busy ? 'Signing out…' : 'Sign out'}
          </Button>
        )}
      </div>

      {session.isVpn && (
        <p className="flex items-start gap-2 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          <Icon name="warning" className="text-base shrink-0" />
          <span>
            This login came through a VPN or proxy, so {precise
              ? 'the map shows the device’s GPS position instead of the IP address location.'
              : 'the location may be wrong: it shows the VPN server, not the device. Allow precise location on that device to see where it really is.'}
          </span>
        </p>
      )}

      {latitude !== null && longitude !== null && (
        <LoginMap latitude={latitude} longitude={longitude} precise={precise} label={place || deviceName(session)} />
      )}
    </div>
  )
}
