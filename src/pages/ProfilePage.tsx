import { useState, useEffect, useCallback } from 'react'
import { profileService } from '@/api/services/profileService'
import type { UserProfile } from '@/types'
import { ProfileHero, PersonalInfoForm, AccountSettings } from '@/components/sections/Profile'
import { Icon } from '@/components/ui/Icon'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'

type Status = 'loading' | 'error' | 'ready'

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info')

  const fetchProfile = useCallback(() => {
    setStatus('loading')
    profileService
      .getProfile()
      .then((data) => {
        setProfile(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (status === 'loading') {
    return (
      <main className="pt-nav pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <LoadingState label="Loading profile…">
          {/* Hero skeleton */}
          <div className="flex items-center gap-5">
            <SkeletonBlock className="h-20 w-20 rounded-full shrink-0" />
            <div className="space-y-3 flex-1">
              <SkeletonBlock className="h-6 w-48 rounded-xl" />
              <SkeletonBlock className="h-4 w-64 rounded-xl" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-8 border-b border-outline-variant pb-4 mt-12">
            <SkeletonBlock className="h-5 w-28 rounded-xl" />
            <SkeletonBlock className="h-5 w-36 rounded-xl" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-4 mt-8">
            <SkeletonBlock className="h-14 w-full rounded-xl" />
            <SkeletonBlock className="h-14 w-full rounded-xl" />
            <SkeletonBlock className="h-14 w-full rounded-xl" />
          </div>
        </LoadingState>
      </main>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <main className="pt-nav pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <ErrorState message="We couldn't load your profile." onRetry={fetchProfile} />
      </main>
    )
  }

  return (
    <main className="pt-nav pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-12">
      <ProfileHero profile={profile} />

      <div className="space-y-8">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-outline-variant overflow-x-auto scrollbar-hide">
          <TabButton
            active={activeTab === 'info'}
            onClick={() => setActiveTab('info')}
            icon="person"
            label="Personal Info"
          />
          <TabButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon="settings"
            label="Account Settings"
          />
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'info' ? (
            <PersonalInfoForm
              profile={profile}
              onSaved={(updated) => setProfile({ ...profile, ...updated })}
            />
          ) : (
            <AccountSettings />
          )}
        </div>
      </div>
    </main>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: string
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
        active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      <Icon name={icon} className="text-lg" />
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
      )}
    </button>
  )
}
