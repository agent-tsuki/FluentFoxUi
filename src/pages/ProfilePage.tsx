import { useState, useEffect } from 'react'
import { profileService } from '@/api/services/profileService'
import type { UserProfile } from '@/types'
import { ProfileHero, PersonalInfoForm, AccountSettings } from '@/components/sections/Profile'
import { Icon } from '@/components/ui/Icon'

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info')

  useEffect(() => {
    profileService.getProfile().then(setProfile)
  }, [])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="progress_activity" className="text-4xl text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto space-y-12">
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
