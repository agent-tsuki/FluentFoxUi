import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'
import { useUI, type BackgroundAnimation } from '@/context/UIContext'
import { useAuth } from '@/context/AuthContext'
import { useModal } from '@/context/ModalContext'
import { authService } from '@/api/services/authService'
import { resolveErrorMessage } from '@/api/errors'
import { SettingToggle as Toggle } from './SettingToggle'
import { DevicesSection } from './DevicesSection'

const BG_OPTIONS: { value: BackgroundAnimation; icon: string; label: string; desc: string }[] = [
  { value: 'petals', icon: 'local_florist', label: 'Sakura Petals', desc: 'Falling cherry blossom petals' },
  { value: 'fish',   icon: 'set_meal',      label: 'Koi Fish',      desc: 'Swimming koi fish animation' },
  { value: 'none',   icon: 'close',         label: 'None',          desc: 'No background animation' },
]

export function AccountSettings() {
  const { mouseFollowerEnabled, toggleMouseFollower, backgroundAnimation, setBackgroundAnimation } = useUI()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [studyReminder, setStudyReminder] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleEmail, setGoogleEmail] = useState<string | undefined>()
  const [googleLoading, setGoogleLoading] = useState(true)
  const [googleConnecting, setGoogleConnecting] = useState(false)
  const [googleMessage, setGoogleMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [xConnected, setXConnected] = useState(false)
  const [xLoading, setXLoading] = useState(true)
  const [xConnecting, setXConnecting] = useState(false)
  const [xMessage, setXMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const { user } = useAuth()
  const { openForgotPassword } = useModal()

  useEffect(() => {
    let cancelled = false
    void authService.getGoogleConnection()
      .then((connection) => {
        if (cancelled) return
        setGoogleConnected(connection.connected)
        setGoogleEmail(connection.providerEmail)
      })
      .catch((error: unknown) => {
        if (!cancelled) setGoogleMessage({ tone: 'error', text: resolveErrorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setGoogleLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    void authService.getXConnection()
      .then((connection) => {
        if (!cancelled) setXConnected(connection.connected)
      })
      .catch((error: unknown) => {
        if (!cancelled) setXMessage({ tone: 'error', text: resolveErrorMessage(error) })
      })
      .finally(() => {
        if (!cancelled) setXLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const linked = query.get('google') === 'linked'
    const errorCode = query.get('google_error')
    if (!linked && !errorCode) return

    if (linked) {
      setGoogleConnected(true)
      setGoogleMessage({ tone: 'success', text: 'Your Google account is connected. You can now sign in with Google or email.' })
    } else {
      const messageByCode: Record<string, string> = {
        oauth_cancelled: 'Google connection was cancelled. No changes were made.',
        oauth_link_email_mismatch: 'Choose the Google account that uses your FoxSensei email address.',
        oauth_identity_already_linked: 'That Google account is already connected to another FoxSensei account.',
        oauth_email_not_verified: 'Google has not verified this email address. Choose another Google account.',
      }
      setGoogleMessage({ tone: 'error', text: messageByCode[errorCode ?? ''] ?? 'Google could not be connected. Please try again.' })
    }

    query.delete('google')
    query.delete('google_error')
    window.history.replaceState({}, '', `${window.location.pathname}${query.size ? `?${query.toString()}` : ''}`)
  }, [])

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const linked = query.get('x') === 'linked'
    const errorCode = query.get('x_error')
    if (!linked && !errorCode) return

    if (linked) {
      setXConnected(true)
      setXMessage({ tone: 'success', text: 'Your X account is connected. You can now sign in with X or email.' })
    } else {
      const messageByCode: Record<string, string> = {
        oauth_cancelled: 'X connection was cancelled. No changes were made.',
        oauth_x_identity_already_linked: 'That X account is already connected to another FoxSensei account.',
      }
      setXMessage({ tone: 'error', text: messageByCode[errorCode ?? ''] ?? 'X could not be connected. Please try again.' })
    }

    query.delete('x')
    query.delete('x_error')
    window.history.replaceState({}, '', `${window.location.pathname}${query.size ? `?${query.toString()}` : ''}`)
  }, [])

  // No change-password endpoint for signed-in users: reuse the emailed-code
  // flow. With a known email the code is sent straight away and the popup
  // opens on the code step; otherwise it opens on the email step.
  const startPasswordReset = () => {
    openForgotPassword(user?.email ? { email: user.email, autoSend: true } : undefined)
  }

  const connectGoogle = async () => {
    setGoogleConnecting(true)
    setGoogleMessage(null)
    try {
      await authService.startGoogleAccountLink()
    } catch (error) {
      setGoogleMessage({ tone: 'error', text: resolveErrorMessage(error) })
      setGoogleConnecting(false)
    }
  }

  const connectX = async () => {
    setXConnecting(true)
    setXMessage(null)
    try {
      await authService.startXAccountLink()
    } catch (error) {
      setXMessage({ tone: 'error', text: resolveErrorMessage(error) })
      setXConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface font-headline">Appearance</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Customize how FoxSensei looks for you
          </p>
        </div>
        <div className="px-8 py-6 flex flex-col gap-6">
          <Toggle
            icon="mouse"
            label="Cursor Trail"
            description="A subtle dot and ring that follow your cursor"
            checked={mouseFollowerEnabled}
            onChange={toggleMouseFollower}
          />

          {/* Background animation selector */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0 mt-0.5">
              <Icon name="animation" className="text-xl" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface font-body">Background Animation</p>
              <p className="text-xs text-on-surface-variant font-body mb-3">Choose the animated background across all pages</p>
              <div className="flex gap-3">
                {BG_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBackgroundAnimation(opt.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-[1.5px] transition-all text-center ${
                      backgroundAnimation === opt.value
                        ? 'border-primary bg-primary/[0.08]'
                        : 'border-outline-variant/40 bg-transparent'
                    }`}
                  >
                    <Icon name={opt.icon} className="text-xl" />
                    <span className="text-2xs font-bold font-label text-on-surface">{opt.label}</span>
                    <span className="text-2xs text-on-surface-variant font-body leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface font-headline">Notifications</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Control what FoxSensei sends you
          </p>
        </div>
        <div className="px-8 py-6 space-y-5">
          <Toggle
            icon="mail"
            label="Email Digest"
            description="Weekly summary of your progress"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            icon="alarm"
            label="Daily Study Reminder"
            description="A gentle nudge to keep your streak alive"
            checked={studyReminder}
            onChange={setStudyReminder}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface font-headline">Security</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Keep your account safe
          </p>
        </div>
        <div className="px-8 py-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0">
                <Icon name="lock_reset" className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface font-body">Reset password</p>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  {user?.email
                    ? <>We'll email a code to <span className="font-semibold text-on-surface">{user.email}</span></>
                    : "We'll email you a code to confirm it's you"}
                </p>
              </div>
            </div>
            <Button variant="outline" className="text-sm px-4 py-2 flex items-center gap-2" onClick={startPasswordReset}>
              <Icon name="mail" className="text-base" />
              Send code
            </Button>
          </div>

          <div className="border-t border-outline-variant" />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0">
                <Icon name="link" className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface font-body">Google account</p>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  {googleLoading
                    ? 'Checking connection…'
                    : googleConnected
                      ? <>Connected{googleEmail ? <> as <span className="font-semibold text-on-surface">{googleEmail}</span></> : ''}. You can sign in with Google.</>
                      : 'Connect Google to sign in with either Google or your email and password.'}
                </p>
              </div>
            </div>
            {googleConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tertiary-container/50 text-tertiary text-xs font-bold">
                <Icon name="check_circle" className="text-base" />
                Connected
              </span>
            ) : (
              <Button
                variant="outline"
                className="text-sm px-4 py-2 flex items-center gap-2"
                onClick={connectGoogle}
                disabled={googleLoading || googleConnecting}
              >
                <Icon name="account_circle" className="text-base" />
                {googleConnecting ? 'Opening Google…' : 'Connect Google'}
              </Button>
            )}
          </div>

          {googleMessage && (
            <p
              role={googleMessage.tone === 'error' ? 'alert' : 'status'}
              className={`text-xs font-body ${googleMessage.tone === 'success' ? 'text-tertiary' : 'text-error'}`}
            >
              {googleMessage.text}
            </p>
          )}

          <div className="border-t border-outline-variant" />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0">
                <Icon name="link" className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface font-body">X account</p>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  {xLoading
                    ? 'Checking connection…'
                    : xConnected
                      ? 'Connected. You can sign in with X.'
                      : 'Connect X to sign in with either X or your email and password.'}
                </p>
              </div>
            </div>
            {xConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-tertiary-container/50 text-tertiary text-xs font-bold">
                <Icon name="check_circle" className="text-base" />
                Connected
              </span>
            ) : (
              <Button
                variant="outline"
                className="text-sm px-4 py-2 flex items-center gap-2"
                onClick={connectX}
                disabled={xLoading || xConnecting}
              >
                <Icon name="account_circle" className="text-base" />
                {xConnecting ? 'Opening X…' : 'Connect X'}
              </Button>
            )}
          </div>

          {xMessage && (
            <p
              role={xMessage.tone === 'error' ? 'alert' : 'status'}
              className={`text-xs font-body ${xMessage.tone === 'success' ? 'text-tertiary' : 'text-error'}`}
            >
              {xMessage.text}
            </p>
          )}
        </div>
      </div>

      <DevicesSection />

      {/* Danger zone */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden border border-error/20">
        <div className="px-8 py-6 border-b border-outline-variant">
          <h2 className="text-lg font-bold text-error font-headline">Danger Zone</h2>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Irreversible actions — proceed with caution
          </p>
        </div>
        <div className="px-8 py-6">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-on-surface font-body">Delete Account</p>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  Permanently remove your account and all study data
                </p>
              </div>
              <Button
                variant="outline"
                className="text-error border-error/30 hover:bg-error/5 text-sm px-4 py-2 flex items-center gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Icon name="delete_forever" className="text-base" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-on-surface font-body">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="text-sm px-4 py-2"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <button
                  className="px-5 py-2 bg-error text-on-error rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Yes, delete my account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
