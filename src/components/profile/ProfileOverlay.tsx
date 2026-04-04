import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/context/AuthContext'
import { useUI } from '@/context/UIContext'

interface ProfileOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileOverlay({ isOpen, onClose }: ProfileOverlayProps) {
  const { logout, updateProfileImage } = useAuth()
  const { overlayProfile, triggerRect, setOverlayProfile } = useUI()
  const [mounted, setMounted] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      document.body.style.overflow = 'hidden'
    } else {
      const timer = setTimeout(() => {
        setMounted(false)
        setShowPicker(false)
      }, 500)
      document.body.style.overflow = 'unset'
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!mounted && !isOpen) return null

  const menAvatars = [
    '/avatars/men/emperor.png',
    '/avatars/men/samurai.png',
    '/avatars/men/noble.png',
    '/avatars/men/warrior.png',
    '/avatars/men/citizen.png',
  ]

  const womenAvatars = [
    '/avatars/women/casual_1.png',
    '/avatars/women/casual_2.png',
    '/avatars/women/geisha_1.png',
    '/avatars/women/geisha_2.png',
    '/avatars/women/traditional.png',
  ]

  const avatars = overlayProfile?.gender === 'female' ? womenAvatars : menAvatars

  const menuItems = [
    { label: 'Profile', icon: 'person', href: '/profile', angle: -160 },
    { label: 'Dashboard', icon: 'dashboard', href: '/dashboard', angle: -120 },
    { label: 'Change Avatar', icon: 'photo_camera', onClick: () => setShowPicker(true), angle: -60 },
    { label: 'Logout', icon: 'logout', onClick: logout, angle: -20, color: 'text-red-500' },
  ]

  const getAvatarPath = () => {
    if (overlayProfile?.profileImage) return overlayProfile.profileImage
    if (overlayProfile?.gender === 'female') return '/avatars/women/geisha_1.png'
    return '/avatars/men/warrior.png'
  }

  // Calculate dimensions and positions
  const finalSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 280 : 384
  
  const initialStyles: React.CSSProperties = triggerRect ? {
    top: triggerRect.top,
    left: triggerRect.left,
    width: triggerRect.width,
    height: triggerRect.height,
    transform: 'translate(0, 0)',
    borderRadius: '9999px',
  } : {
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    transform: 'translate(-50%, -50%)',
    borderRadius: '9999px',
  }

  const finalStyles: React.CSSProperties = {
    top: '50%',
    left: '50%',
    width: finalSize,
    height: finalSize,
    transform: 'translate(-50%, -50%)',
    borderRadius: '9999px',
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-500 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-3xl cursor-pointer" 
        onClick={onClose}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full z-[10010]"
      >
        <Icon name="close" className="text-4xl" />
      </button>

      {/* Back Button (when in picker) */}
      {showPicker && (
        <button
          onClick={() => setShowPicker(false)}
          className="absolute top-8 left-8 text-white/70 hover:text-white transition-all p-3 hover:bg-white/10 rounded-full z-[10010] flex items-center gap-2 group"
        >
          <Icon name="arrow_back" className="text-4xl group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-sm">Back</span>
        </button>
      )}

      {/* Profile Container */}
      <div className="relative w-full h-full pointer-events-none">
        {/* Enlarged Image (Transitional) */}
        <div 
          className="fixed z-[10000] border-4 border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-auto"
          style={isOpen ? finalStyles : initialStyles}
        >
          <img
            src={getAvatarPath()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Semi-circular Menu / Avatar Picker */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-[10005] pointer-events-none transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {!showPicker ? (
            // Main Menu
            menuItems.map((item) => {
              const radius = finalSize / 2 + 60
              const x = Math.cos((item.angle * Math.PI) / 180) * radius
              const y = Math.sin((item.angle * Math.PI) / 180) * radius

              const content = (
                <>
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-200 border border-slate-100 dark:border-slate-700">
                    <Icon name={item.icon} className={`text-2xl ${item.color || 'text-slate-700 dark:text-slate-200'}`} />
                  </div>
                  <span className="text-white font-bold text-xs tracking-wider uppercase drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </>
              )

              const style: React.CSSProperties = {
                transform: `translate(${x}px, ${y}px)`,
              }

              return item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={onClose}
                  className="absolute left-1/2 top-1/2 -ml-16 -mt-16 w-32 flex flex-col items-center group pointer-events-auto"
                  style={style}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick?.()
                    if (item.label !== 'Change Avatar') onClose()
                  }}
                  className="absolute left-1/2 top-1/2 -ml-16 -mt-16 w-32 flex flex-col items-center group pointer-events-auto"
                  style={style}
                >
                  {content}
                </button>
              )
            })
          ) : (
            // Avatar Picker
            avatars.map((avatar, index) => {
              const radius = finalSize / 2 + 80
              const step = 220 / (avatars.length - 1)
              const angle = -200 + index * step
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              return (
                <button
                  key={avatar}
                  onClick={() => {
                    updateProfileImage(avatar)
                    if (overlayProfile) {
                      setOverlayProfile({ ...overlayProfile, profileImage: avatar })
                    }
                    setShowPicker(false)
                  }}
                  className="absolute left-1/2 top-1/2 -ml-10 -mt-10 w-20 h-20 rounded-full border-4 border-white/20 hover:border-white transition-all shadow-xl overflow-hidden group pointer-events-auto hover:scale-125 z-[10020]"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    transitionDelay: `${index * 40}ms`
                  }}
                >
                  <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
