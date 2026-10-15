import { SectionHeader } from '@/components/ui/SectionHeader'
import { FadeIn } from '@/components/ui/FadeIn'
import { Icon } from '@/components/ui/Icon'

const NAV_ITEMS = [
  { icon: 'home',      label: 'Overview',     active: true },
  { icon: 'menu_book', label: 'Grammar',      active: false },
  { icon: 'style',     label: 'Flashcards',   active: false },
  { icon: 'quiz',      label: 'Quizzes',      active: false },
  { icon: 'public',    label: 'Free Courses', active: false },
  { icon: 'settings',  label: 'Settings',     active: false },
]

const MISTAKE_ITEMS = [
  { topic: 'て-form verbs',         pct: 72 },
  { topic: 'は vs が particle',      pct: 55 },
  { topic: 'Katakana row ラリルレロ', pct: 40 },
  { topic: 'N4 Kanji set 3',        pct: 30 },
]

const RECENT_QUIZZES = [
  { name: 'Hiragana Speed Test',  date: 'Today • 5 min',   score: '95%', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'N5 Vocab Chapter 3',   date: 'Yesterday • 8 min', score: '88%', colorClass: 'text-emerald-600 dark:text-emerald-400' },
  { name: 'て-form Grammar Quiz', date: '2 days ago',       score: '62%', colorClass: 'text-amber-600 dark:text-amber-400' },
  { name: 'Katakana Matching',    date: '3 days ago',       score: '48%', colorClass: 'text-primary' },
]

export function DashboardPreview() {
  return (
    <section className="relative z-10 py-24 px-6 md:px-10 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Progress Dashboard"
          title="Know Exactly Where You Stand"
          description="Your personal dashboard surfaces weak spots, shows quiz history, and celebrates your streaks — so every study session is intentional."
          eyebrowVariant="pill"
          align="left"
          descriptionClassName="text-lg"
        />

        {/* Mock dashboard */}
        <FadeIn delay={120}>
          <div className="mt-12 bg-surface-container-lowest rounded-2xl border-[1.5px] border-outline-variant/40 shadow-elevation-2 overflow-hidden grid md:grid-cols-[240px_1fr] min-h-[400px]">
            {/* Sidebar */}
            <div className="hidden md:block p-7 bg-surface-inverse">
              <p className="text-2xs font-extrabold uppercase tracking-[2px] mb-4 text-on-surface-inverse-variant/70">Menu</p>
              {NAV_ITEMS.map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm font-bold cursor-pointer transition-all ${
                    item.active
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-inverse-variant'
                  }`}
                >
                  <Icon name={item.icon} className="text-lg" />
                  <span className="font-label">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="p-7">
              <p className="text-xl font-extrabold text-on-surface font-headline mb-1 flex items-center gap-2">
                Good morning, Yuki!
                <Icon name="waving_hand" className="text-lg text-primary" />
              </p>
              <p className="text-sm text-on-surface-variant font-body mb-6">You're on a 7-day streak. Keep it going!</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { num: '7', label: 'Day Streak',      colorClass: 'text-primary', icon: 'local_fire_department' },
                  { num: '142', label: 'Cards Reviewed',   colorClass: 'text-on-surface' },
                  { num: '18',  label: 'Quizzes Done',     colorClass: 'text-on-surface' },
                  { num: '82%', label: 'Avg. Score',        colorClass: 'text-emerald-600 dark:text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="bg-surface-container rounded-xl p-4 text-center">
                    <div className={`text-2xl font-black font-headline flex items-center justify-center gap-1 ${s.colorClass}`}>
                      {'icon' in s && s.icon && <Icon name={s.icon} className="text-lg" />}
                      {s.num}
                    </div>
                    <div className="text-2xs font-bold text-on-surface-variant font-label mt-0.5 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Weak topics */}
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs font-extrabold text-on-surface font-label mb-3 flex items-center gap-1.5">
                    <Icon name="warning" className="text-warning text-base" /> Topics to Revisit
                  </p>
                  {MISTAKE_ITEMS.map(m => (
                    <div key={m.topic} className="flex items-center mb-2.5 gap-2">
                      <span className="text-xs text-on-surface-variant font-body flex-shrink-0 w-32 truncate">{m.topic}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-outline-variant/30">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold font-label text-primary">{m.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Recent quizzes */}
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs font-extrabold text-on-surface font-label mb-3 flex items-center gap-1.5">
                    <Icon name="checklist" className="text-primary text-base" /> Recent Quizzes
                  </p>
                  {RECENT_QUIZZES.map(q => (
                    <div key={q.name} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-b-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface font-label">{q.name}</p>
                        <p className="text-2xs text-on-surface-variant font-body">{q.date}</p>
                      </div>
                      <span className={`text-xs font-extrabold font-label ${q.colorClass}`}>{q.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
