import type { UserProfile } from '@/types'
import { Icon } from '@/components/ui/Icon'

interface ProfileHeroProps {
  profile: UserProfile
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="bg-surface-container-low rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary text-3xl font-extrabold shadow-xl select-none font-headline">
          {initials}
        </div>
        {profile.isPro && (
          <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-tighter shadow-md">
            Pro
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-center sm:text-left space-y-3">
        <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary font-label block">
          Learner Profile
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
          {profile.firstName} {profile.lastName}
        </h1>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full text-sm font-semibold text-on-surface">
            <Icon name="stars" className="text-base text-primary" filled />
            JLPT {profile.targetLevel}
          </div>
          {profile.location && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full text-sm font-semibold text-on-surface">
              <Icon name="location_on" className="text-base text-on-surface-variant" />
              {profile.location}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-highest rounded-full text-sm font-semibold text-on-surface">
            <Icon name="calendar_today" className="text-base text-on-surface-variant" />
            Joined {profile.joinedDate}
          </div>
        </div>
      </div>
    </div>
  )
}
