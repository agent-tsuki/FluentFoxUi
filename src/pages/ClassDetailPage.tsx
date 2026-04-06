import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { classTeachers } from '@/api/mock/classes'
import type { Platform, CourseReview } from '@/api/mock/classes'
import { Icon } from '@/components/ui/Icon'

const PLATFORM_META: Record<Platform, { label: string; icon: string; color: string }> = {
  youtube: { label: 'YouTube', icon: 'smart_display', color: '#FF4444' },
  udemy:   { label: 'Udemy',   icon: 'school',        color: '#A435F0' },
  website: { label: 'Website', icon: 'language',      color: '#2980B9' },
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const px = size === 'lg' ? 22 : size === 'md' ? 18 : 14
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{ fontSize: px }}
          className={i < full ? 'text-amber-400' : i === full && half ? 'text-amber-300' : 'text-outline-variant'}
        >
          ★
        </span>
      ))}
    </span>
  )
}

function RatingBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-5 text-right text-on-surface-variant font-semibold text-xs">{label}★</span>
      <div className="flex-1 h-2 rounded-full bg-surface-container-high overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.2 }}
        />
      </div>
      <span className="text-xs text-on-surface-variant w-4">{value}</span>
    </div>
  )
}

function ReviewCard({ review }: { review: CourseReview }) {
  return (
    <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {review.author[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface">{review.author}</p>
            <p className="text-xs text-on-surface-variant">{review.date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">"{review.text}"</p>
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/60">
        <Icon name="thumb_up" className="text-xs" />
        <span>{review.helpful} found this helpful</span>
      </div>
    </div>
  )
}

function AccordionItem({ title, topics, index }: { title: string; topics: string[]; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-outline-variant/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-surface-container-lowest hover:bg-surface-container transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-on-surface">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-on-surface-variant hidden sm:block">{topics.length} topics</span>
          <Icon
            name="expand_more"
            className={`text-xl text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ul className="px-5 py-4 space-y-2.5 bg-surface-container/40 border-t border-outline-variant/20">
              {topics.map((topic) => (
                <li key={topic} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                  <Icon name="check_circle" className="text-base text-emerald-500 flex-shrink-0 mt-0.5" />
                  {topic}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ClassDetailPage() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const teacher = classTeachers.find((t) => t.id === teacherId)

  if (!teacher) return <Navigate to="/classes" replace />

  const meta = PLATFORM_META[teacher.platform]

  // Fake rating distribution based on overall rating
  const ratingDist = [
    { star: 5, value: Math.round(teacher.rating * 0.8 * 10) / 10 },
    { star: 4, value: Math.round(teacher.rating * 0.7 * 10) / 10 },
    { star: 3, value: Math.round(teacher.rating * 0.4 * 10) / 10 },
    { star: 2, value: Math.round(teacher.rating * 0.2 * 10) / 10 },
    { star: 1, value: Math.round(teacher.rating * 0.1 * 10) / 10 },
  ]

  return (
    <main className="pt-20 pb-20 min-h-screen">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${meta.color}12 0%, transparent 60%)`,
          borderBottom: '1px solid var(--color-outline-variant, rgba(0,0,0,0.08))',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-12">
          {/* Back */}
          <Link
            to="/classes"
            className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface font-semibold mb-8 transition-colors"
          >
            <Icon name="arrow_back" className="text-base" />
            Back to Free Classes
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-white font-headline font-extrabold text-3xl flex-shrink-0 shadow-2xl"
              style={{ backgroundColor: teacher.avatarColor }}
              aria-hidden="true"
            >
              {teacher.avatarInitials}
            </motion.div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              {/* Platform badge */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                style={{ color: meta.color, background: `${meta.color}18` }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{meta.icon}</span>
                {meta.label}
              </span>

              <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter text-on-surface leading-tight">
                {teacher.name}
              </h1>

              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl">
                {teacher.bio}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <StarRating rating={teacher.rating} size="md" />
                  <span className="font-bold text-on-surface">{teacher.rating}</span>
                  <span className="text-sm text-on-surface-variant">({teacher.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                  <Icon name="group" className="text-base" />
                  {teacher.studentCount} students
                </div>
                {teacher.videoCount && (
                  <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                    <Icon name="play_circle" className="text-base" />
                    {teacher.videoCount}
                  </div>
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    teacher.free
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {teacher.free ? 'Free' : teacher.priceNote}
                </span>
              </div>

              {/* Highlight pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {teacher.highlights.map((h) => (
                  <span
                    key={h}
                    className="text-xs px-3 py-1 rounded-full bg-surface-container font-semibold text-on-surface-variant border border-outline-variant/30"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="w-full md:w-64 flex-shrink-0 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-lg md:sticky md:top-24 self-start">
              <div className="text-center space-y-1">
                <p className="text-2xl font-headline font-extrabold text-on-surface">
                  {teacher.free ? '100% Free' : teacher.priceNote}
                </p>
                {!teacher.free && (
                  <p className="text-xs text-on-surface-variant">Sale prices available</p>
                )}
              </div>
              <a
                href={teacher.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: meta.color }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{meta.icon}</span>
                Visit on {meta.label}
              </a>
              <div className="space-y-2 text-xs text-on-surface-variant">
                {[
                  { icon: 'schedule', label: 'Self-paced, learn anytime' },
                  { icon: 'language', label: 'English instruction' },
                  { icon: 'device_unknown', label: 'Mobile & desktop' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <Icon name={item.icon} className="text-base text-on-surface-variant/60" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-14">

            {/* What You'll Learn */}
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-5 flex items-center gap-2">
                <Icon name="checklist" className="text-xl text-primary" />
                What You'll Learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.whatYouLearn.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-on-surface-variant">
                    <Icon name="check_circle" className="text-base text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Curriculum */}
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-5 flex items-center gap-2">
                <Icon name="menu_book" className="text-xl text-primary" />
                Course Curriculum
              </h2>
              <div className="space-y-2.5">
                {teacher.curriculum.map((section, i) => (
                  <AccordionItem
                    key={section.title}
                    title={section.title}
                    topics={section.topics}
                    index={i}
                  />
                ))}
              </div>
            </section>

            {/* About the Teacher */}
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-5 flex items-center gap-2">
                <Icon name="person" className="text-xl text-primary" />
                About {teacher.name}
              </h2>
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: teacher.avatarColor }}
                  aria-hidden="true"
                >
                  {teacher.avatarInitials}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{teacher.longBio}</p>
              </div>
            </section>

            {/* Pros & Cons */}
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-5 flex items-center gap-2">
                <Icon name="balance" className="text-xl text-primary" />
                Pros & Cons
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Icon name="thumb_up" className="text-sm" />
                    Pros
                  </p>
                  {teacher.pros.map((pro) => (
                    <div key={pro} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-on-surface-variant leading-relaxed">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                    <Icon name="thumb_down" className="text-sm" />
                    Cons
                  </p>
                  {teacher.cons.map((con) => (
                    <div key={con} className="flex items-start gap-2 text-sm">
                      <span className="text-rose-400 flex-shrink-0 mt-0.5">✗</span>
                      <span className="text-on-surface-variant leading-relaxed">{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-6 flex items-center gap-2">
                <Icon name="reviews" className="text-xl text-primary" />
                Student Reviews
              </h2>

              {/* Rating summary */}
              <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 bg-surface-container-low border border-outline-variant/20 rounded-2xl">
                <div className="text-center flex-shrink-0 space-y-1">
                  <p className="text-6xl font-headline font-extrabold text-on-surface">
                    {teacher.rating}
                  </p>
                  <StarRating rating={teacher.rating} size="lg" />
                  <p className="text-xs text-on-surface-variant">Course Rating</p>
                </div>
                <div className="flex-1 space-y-2 justify-center flex flex-col">
                  {ratingDist.map((r) => (
                    <RatingBar key={r.star} label={String(r.star)} value={r.value} />
                  ))}
                </div>
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {teacher.reviews.map((review) => (
                  <ReviewCard key={review.author} review={review} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Topics Covered</p>
              <div className="flex flex-wrap gap-2">
                {teacher.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform info */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Platform Details</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base" style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="font-semibold">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Icon name="payments" className="text-base" />
                  <span>{teacher.priceNote}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Icon name="grade" className="text-base" />
                  <span>JLPT {teacher.level} level</span>
                </div>
              </div>
              <a
                href={teacher.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shadow transition-opacity hover:opacity-90"
                style={{ backgroundColor: meta.color }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{meta.icon}</span>
                Open on {meta.label}
              </a>
            </div>

            {/* Other courses link */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Explore More
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Browse all our curated N5 teachers and find the style that suits you best.
              </p>
              <Link
                to="/classes"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-outline-variant/40 text-on-surface hover:bg-surface-container transition-colors"
              >
                <Icon name="grid_view" className="text-base" />
                View All Classes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
