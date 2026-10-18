import type { UserProfile } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Eyebrow } from '@/components/ui/SectionHeader'
import { useUI } from '@/context/UIContext'
import { asset } from '@/lib/assets'
import { placeLabel } from '@/lib/profile/countries'
import { monthYear, timeAgo } from '@/lib/profile/formatTime'
import { deviceName, devicePlace } from '@/lib/profile/deviceLabel'

interface ProfileHeroProps {
  profile:        UserProfile
  onChangeAvatar: () => void
}

export function ProfileHero({ profile, onChangeAvatar }: ProfileHeroProps) {
  const { setIsProfileOverlayOpen, setOverlayProfile, setTriggerRect } = useUI()
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ')
  const location = placeLabel(profile.city, profile.countryCode)
  const lastLogin = profile.lastLogin

  return (
    <div className="bg-surface-container-low rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
      <div className="flex flex-col items-center gap-3 shrink-0">
        <button
          type="button"
          aria-label="Open profile menu"
          className="relative cursor-pointer group/hero-avatar"
          onClick={(e) => {
            setOverlayProfile({ firstName: profile.firstName, profileImage: profile.avatar.url })
            setTriggerRect(e.currentTarget.getBoundingClientRect())
            setIsProfileOverlayOpen(true)
          }}
        >
          <div className="w-28 h-28 rounded-full border-4 border-primary/10 group-hover/hero-avatar:border-primary transition-all shadow-elevation-2 overflow-hidden bg-surface-container-highest">
            <img
              src={asset(profile.avatar.url)}
              alt={fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover/hero-avatar:scale-110 transition-transform duration-500"
            />
          </div>
        </button>
        <button
          type="button"
          onClick={onChangeAvatar}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
        >
          <Icon name="photo_camera" className="text-base" />
          Change photo
        </button>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-3">
        <Eyebrow variant="plain" className="mb-0">
          Learner Profile
        </Eyebrow>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">{fullName}</h1>
          <p className="text-sm font-semibold text-on-surface-variant mt-1">@{profile.username}</p>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
          {profile.targetLevel && (
            <Chip icon="stars" iconClass="text-primary" filled>Target JLPT {profile.targetLevel}</Chip>
          )}
          {location && <Chip icon="location_on">{location}</Chip>}
          <Chip icon="calendar_today">Joined {monthYear(profile.joinedAt)}</Chip>
        </div>

        {lastLogin && (
          <p className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-xs text-on-surface-variant pt-1">
            <Icon name="history_edu" className="text-sm" />
            <span>
              Last login {timeAgo(lastLogin.createdAt)} · {deviceName(lastLogin)}
              {devicePlace(lastLogin) && <> · {devicePlace(lastLogin)}</>}
              {lastLogin.ipApprox && <> · IP {lastLogin.ipApprox}</>}
            </span>
            {lastLogin.isVpn && (
              <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 font-semibold text-error">
                <Icon name="warning" className="text-sm" /> VPN
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

interface ChipProps {
  icon:       string
  iconClass?: string
  filled?:    boolean
  children:   React.ReactNode
}

function Chip({ icon, iconClass = 'text-on-surface-variant', filled, children }: ChipProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full text-sm font-semibold text-on-surface">
      <Icon name={icon} className={`text-base ${iconClass}`} filled={filled} />
      {children}
    </div>
  )
}
