import { FadeIn } from '@/components/ui/FadeIn'

const NAV_ITEMS = [
  { icon: '🏠', label: 'Overview',     active: true },
  { icon: '📖', label: 'Grammar',      active: false },
  { icon: '🃏', label: 'Flashcards',   active: false },
  { icon: '✏️', label: 'Quizzes',      active: false },
  { icon: '🌐', label: 'Free Courses', active: false },
  { icon: '⚙️', label: 'Settings',     active: false },
]

const MISTAKE_ITEMS = [
  { topic: 'て-form verbs',         pct: 72 },
  { topic: 'は vs が particle',      pct: 55 },
  { topic: 'Katakana row ラリルレロ', pct: 40 },
  { topic: 'N4 Kanji set 3',        pct: 30 },
]

const RECENT_QUIZZES = [
  { name: 'Hiragana Speed Test',  date: 'Today • 5 min',   score: '95%', color: '#06D6A0' },
  { name: 'N5 Vocab Chapter 3',   date: 'Yesterday • 8 min', score: '88%', color: '#06D6A0' },
  { name: 'て-form Grammar Quiz', date: '2 days ago',       score: '62%', color: '#FFD166' },
  { name: 'Katakana Matching',    date: '3 days ago',       score: '48%', color: '#EA6B44' },
]

export function DashboardPreview() {
  return (
    <section className="relative z-10 py-24 px-6 md:px-10 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <span className="inline-block bg-primary/10 text-primary text-[11px] font-extrabold tracking-[2px] uppercase px-4 py-1.5 rounded-full border border-primary/20 mb-4">
            Progress Dashboard
          </span>
          <h2 className="font-headline text-4xl md:text-[2.8rem] font-extrabold text-on-surface leading-tight mb-3">
            Know Exactly Where You Stand
          </h2>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed font-body">
            Your personal dashboard surfaces weak spots, shows quiz history, and celebrates your streaks — so every study session is intentional.
          </p>
        </FadeIn>

        {/* Mock dashboard */}
        <FadeIn delay={120}>
          <div className="mt-12 bg-surface-container-lowest rounded-2xl border-[1.5px] border-outline-variant/40 shadow-xl overflow-hidden grid md:grid-cols-[240px_1fr] min-h-[400px]">
            {/* Sidebar */}
            <div className="hidden md:block p-7 bg-[#2f2521]">
              <p className="text-[10px] font-extrabold uppercase tracking-[2px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Menu</p>
              {NAV_ITEMS.map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm font-bold cursor-pointer transition-all"
                  style={item.active
                    ? { background: '#EA6B44', color: 'white' }
                    : { color: 'rgba(255,255,255,0.65)' }
                  }
                >
                  <span>{item.icon}</span>
                  <span className="font-label">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="p-7">
              <p className="text-xl font-extrabold text-on-surface font-headline mb-1">Good morning, Shivam! 👋</p>
              <p className="text-sm text-on-surface-variant font-body mb-6">You're on a 7-day streak. Keep it going!</p>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { num: '🔥 7', label: 'Day Streak',      color: '#EA6B44' },
                  { num: '142', label: 'Cards Reviewed',   color: undefined },
                  { num: '18',  label: 'Quizzes Done',     color: undefined },
                  { num: '82%', label: 'Avg. Score',        color: '#06D6A0' },
                ].map(s => (
                  <div key={s.label} className="bg-surface-container rounded-xl p-4 text-center">
                    <div className="text-2xl font-black font-headline" style={s.color ? { color: s.color } : {}}>{s.num}</div>
                    <div className="text-[10px] font-bold text-on-surface-variant font-label mt-0.5 uppercase tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Two columns */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Weak topics */}
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs font-extrabold text-on-surface font-label mb-3">⚠️ Topics to Revisit</p>
                  {MISTAKE_ITEMS.map(m => (
                    <div key={m.topic} className="flex items-center mb-2.5 gap-2">
                      <span className="text-xs text-on-surface-variant font-body flex-shrink-0 w-[130px] truncate">{m.topic}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-outline-variant/30">
                        <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: '#EA6B44' }} />
                      </div>
                      <span className="text-xs font-bold font-label" style={{ color: '#EA6B44' }}>{m.pct}%</span>
                    </div>
                  ))}
                </div>

                {/* Recent quizzes */}
                <div className="bg-surface-container rounded-xl p-4">
                  <p className="text-xs font-extrabold text-on-surface font-label mb-3">📋 Recent Quizzes</p>
                  {RECENT_QUIZZES.map(q => (
                    <div key={q.name} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-b-0">
                      <div>
                        <p className="text-xs font-bold text-on-surface font-label">{q.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-body">{q.date}</p>
                      </div>
                      <span className="text-xs font-extrabold font-label" style={{ color: q.color }}>{q.score}</span>
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
