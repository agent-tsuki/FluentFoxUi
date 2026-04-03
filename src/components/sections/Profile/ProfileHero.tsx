import type { UserProfile } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { useUI } from '@/context/UIContext'

interface ProfileHeroProps {
  profile: UserProfile
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const { setIsProfileOverlayOpen, setOverlayProfile, setTriggerRect } = useUI()

  return (
    <div className="bg-surface-container-low rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
      {/* Avatar */}
      <div 
        className="relative shrink-0 cursor-pointer group/hero-avatar"
        onClick={(e) => {
          setOverlayProfile(profile)
          setTriggerRect(e.currentTarget.getBoundingClientRect())
          setIsProfileOverlayOpen(true)
        }}
      >
        <div className="w-28 h-28 rounded-full border-4 border-primary/10 group-hover/hero-avatar:border-primary transition-all shadow-xl overflow-hidden bg-surface-container-highest">
          <img 
            src={
              profile.profileImage || 
              (profile.gender === 'female' ? '/avatars/women/geisha_1.png' : '/avatars/men/warrior.png')
            } 
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-full h-full object-cover group-hover/hero-avatar:scale-110 transition-transform duration-500"
          />
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
