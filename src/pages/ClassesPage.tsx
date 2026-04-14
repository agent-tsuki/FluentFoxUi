import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { classTeachers } from '@/api/mock/classes'
import type { JLPTLevel, Platform, ClassTeacher } from '@/api/mock/classes'
import { Icon } from '@/components/ui/Icon'

const MotionLink = motion(Link)

const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const LOCKED_LEVELS = new Set<JLPTLevel>(['N4', 'N3', 'N2', 'N1'])

const PLATFORM_META: Record<Platform, { label: string; icon: string; color: string; bg: string }> = {
  youtube: { label: 'YouTube', icon: 'smart_display', color: '#FF4444', bg: 'bg-red-50 dark:bg-red-950/30' },
  udemy:   { label: 'Udemy',   icon: 'school',        color: '#A435F0', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  website: { label: 'Website', icon: 'language',      color: '#2980B9', bg: 'bg-blue-50 dark:bg-blue-950/30' },
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const sizeClass = size === 'md' ? 'text-lg' : 'text-sm'
  return (
    <span className={`flex items-center gap-0.5 ${sizeClass}`} aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full
              ? 'text-amber-400'
              : i === full && half
              ? 'text-amber-300'
              : 'text-outline-variant'
          }
          style={{ fontSize: size === 'md' ? 18 : 14 }}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform]
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
      style={{ color: meta.color, background: `${meta.color}18` }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{meta.icon}</span>
      {meta.label}
    </span>
  )
}

function TeacherCard({ teacher, index }: { teacher: ClassTeacher; index: number }) {
  const [hovered, setHovered] = useState(false)
  const meta = PLATFORM_META[teacher.platform]

  return (
    <MotionLink
      to={`/classes/${teacher.id}`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.32, delay: index * 0.06 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        boxShadow: hovered
          ? `0 20px 48px ${meta.color}28, 0 4px 16px rgba(0,0,0,0.08)`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.35s ease',
      }}
      className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Platform color accent bar — slides in on hover */}
      <motion.div
        className="h-[3px] origin-left"
        style={{ backgroundColor: meta.color }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* Card Header */}
      <div className={`${meta.bg} px-4 pt-4 pb-3 flex items-start gap-3`}>
        {/* Avatar — bounces on hover */}
        <motion.div
          animate={hovered ? { scale: 1.14, rotate: -5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-headline font-extrabold text-sm flex-shrink-0 shadow-md"
          style={{ backgroundColor: teacher.avatarColor }}
          aria-hidden="true"
        >
          {teacher.avatarInitials}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <PlatformBadge platform={teacher.platform} />
              <h3 className="font-headline font-bold text-on-surface text-sm mt-1 leading-tight truncate">
                {teacher.name}
              </h3>
            </div>
            {teacher.free ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0 uppercase tracking-wide">
                Free
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0 uppercase tracking-wide">
                Paid
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={teacher.rating} />
            <span className="text-[11px] text-on-surface-variant font-semibold">{teacher.rating}</span>
            <span className="text-[11px] text-on-surface-variant/50">({teacher.reviewCount.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Course title */}
      <div className="px-4 pt-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 mb-0.5">Course</p>
        <p className="text-xs font-semibold text-on-surface leading-snug line-clamp-2">
          {teacher.courseTitle}
        </p>
      </div>

      {/* Bio */}
      <p className="px-4 pt-2 text-xs text-on-surface-variant leading-relaxed line-clamp-2 flex-1">
        {teacher.bio}
      </p>

      {/* Highlights */}
      <div className="px-4 pt-2.5 flex flex-wrap gap-1">
        {teacher.highlights.map((h) => (
          <span
            key={h}
            className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container font-semibold text-on-surface-variant border border-outline-variant/20"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 mt-2.5 flex items-center justify-between border-t border-outline-variant/20">
        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
          <Icon name="group" className="text-sm" />
          <span>{teacher.studentCount}</span>
        </div>
        <div className="inline-flex items-center gap-1 text-xs font-bold text-primary">
          View Course
          <motion.span
            animate={hovered ? { x: [0, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.5, repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
            className="material-symbols-outlined"
            style={{ fontSize: 14 }}
          >
            arrow_forward
          </motion.span>
        </div>
      </div>
    </MotionLink>
  )
}

function LockedLevelCard({ level }: { level: JLPTLevel }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner">
        <Icon name="lock" className="text-4xl text-on-surface-variant/40" />
      </div>
      <span className="text-xs uppercase tracking-widest font-bold bg-surface-container-high text-on-surface-variant px-4 py-1.5 rounded-full">
        {level} Courses
      </span>
      <h3 className="text-2xl font-headline font-bold text-on-surface tracking-tighter">Coming Soon</h3>
      <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
        We're curating the best {level} resources. Start with N5 and we'll notify you when {level} courses go live.
      </p>
    </div>
  )
}

export function ClassesPage() {
  const [activeLevel, setActiveLevel] = useState<JLPTLevel>('N5')
  const [activePlatform, setActivePlatform] = useState<Platform | 'all'>('all')

  const filtered = useMemo(() => {
    if (LOCKED_LEVELS.has(activeLevel)) return []
    return classTeachers.filter(
      (t) =>
        t.level === activeLevel &&
        (activePlatform === 'all' || t.platform === activePlatform)
    )
  }, [activeLevel, activePlatform])

  const platforms: Array<Platform | 'all'> = ['all', 'youtube', 'udemy', 'website']

  return (
    <main className="pt-24 pb-20 min-h-screen">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-8 text-center space-y-4">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-full bg-primary/10 text-primary">
          <Icon name="school" className="text-base" />
          Curated Free Resources
        </span>
        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter text-on-surface">
          Learn Japanese{' '}
          <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 dark:from-orange-400 dark:via-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
            for Free
          </span>
        </h1>
        <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Hand-picked teachers and courses from across the internet — YouTube channels, structured Udemy
          courses, and dedicated platforms — all reviewed by real learners.
        </p>
        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-on-surface-variant">
          {[
            { icon: 'play_circle', label: '6 Curated Teachers' },
            { icon: 'star', label: 'All 4.5+ Rated' },
            { icon: 'verified', label: 'JLPT Aligned' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 font-semibold">
              <Icon name={s.icon} className="text-base text-primary" />
              {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-[73px] z-30 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Level tabs */}
          <div className="flex items-center gap-1 bg-surface-container rounded-xl p-1">
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => { setActiveLevel(level); setActivePlatform('all') }}
                className={`relative px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeLevel === level
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {level}
                {LOCKED_LEVELS.has(level) && (
                  <span className="ml-1 opacity-60">🔒</span>
                )}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {platforms.map((p) => {
              const isAll = p === 'all'
              const meta = isAll ? null : PLATFORM_META[p]
              return (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                    activePlatform === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/40 text-on-surface-variant hover:border-outline-variant hover:text-on-surface bg-transparent'
                  }`}
                >
                  {meta ? (
                    <span className="material-symbols-outlined" style={{ fontSize: 13, color: activePlatform === p ? undefined : meta.color }}>
                      {meta.icon}
                    </span>
                  ) : (
                    <Icon name="filter_list" className="text-xs" />
                  )}
                  {isAll ? 'All Platforms' : meta!.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        {LOCKED_LEVELS.has(activeLevel) ? (
          <div className="grid grid-cols-1">
            <LockedLevelCard level={activeLevel} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Icon name="search_off" className="text-5xl text-on-surface-variant/30" />
            <p className="text-on-surface-variant font-semibold">No courses found for this filter.</p>
            <button
              onClick={() => setActivePlatform('all')}
              className="text-sm text-primary font-bold hover:underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${activeLevel}-${activePlatform}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((teacher, i) => (
                <TeacherCard key={teacher.id} teacher={teacher} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl px-8 py-10 text-center space-y-4">
          <Icon name="tips_and_updates" className="text-4xl text-primary" />
          <h2 className="text-2xl font-headline font-bold text-on-surface tracking-tighter">
            Know a great free resource we missed?
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto leading-relaxed">
            We review and add new teachers regularly. Our goal is to have the most complete curated list
            of free Japanese learning resources on the internet.
          </p>
          <a
            href="mailto:hello@foxsensei.app"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <Icon name="mail" className="text-base" />
            Suggest a Resource
          </a>
        </div>
      </section>
    </main>
  )
}
