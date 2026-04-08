import type { DashboardData, DayActivity } from '@/types'

// ─── Streak calendar mock data ────────────────────────────────────────────────

function buildMockActivities(): DayActivity[] {
  // Today: 2026-04-07 (Tuesday). Last 27 days = current streak (always studied).
  const today = new Date(2026, 3, 7) // month is 0-indexed

  // Deterministic minute amounts — cycles through this array based on day index
  const basePattern  = [60, 0, 45, 75, 0, 30, 90, 0, 55, 60, 0, 45, 30, 0, 80, 60, 0, 45, 0, 70, 90, 0, 55, 40, 70, 0, 65]
  const streakPattern = [45, 60, 30, 75, 90, 55, 80, 65, 50, 70, 90, 45, 60, 30]

  const result: DayActivity[] = []

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dow = d.getDay() // 0=Sun 6=Sat

    let minutes: number
    if (i < 27) {
      // Active streak — always has activity, varied intensity
      minutes = streakPattern[i % streakPattern.length]
    } else {
      const base = basePattern[(364 - i) % basePattern.length]
      // Reduce weekends — if base is low on a weekend, treat as rest day
      minutes = (dow === 0 || dow === 6) && base < 50 ? 0 : base
    }

    result.push({ date: dateStr, minutes })
  }
  return result
}

function computeCalendarStats(activities: DayActivity[]) {
  const totalActiveDays = activities.filter(a => a.minutes > 0).length
  const thisWeekMinutes = activities.slice(-7).reduce((s, a) => s + a.minutes, 0)
  let longestStreak = 0, cur = 0
  for (const a of activities) {
    cur = a.minutes > 0 ? cur + 1 : 0
    if (cur > longestStreak) longestStreak = cur
  }
  return { totalActiveDays, thisWeekMinutes, longestStreak }
}

const _activities = buildMockActivities()
const _calStats   = computeCalendarStats(_activities)

// ─────────────────────────────────────────────────────────────────────────────

export const mockDashboardData: DashboardData = {
  stats: {
    studyHours: 312,
    cardsReviewed: 8_540,
    globalRank: 'Top 8%',
    currentStreak: 27,
    jlptProgress: 68,
    targetLevel: 'N3',
  },

  skillBalance: {
    kanji: 78,
    grammar: 62,
    listening: 45,
    vocabulary: 71,
    reading: 55,
    speaking: 33,
  },

  milestones: [
    {
      id: 'kanji-master',
      icon: 'translate',
      title: 'Kanji Streak',
      subtitle: '780 / 1000 characters practiced',
      progressValue: 780,
      progressMax: 1000,
      colorClass: 'text-primary',
    },
    {
      id: 'streak-king',
      icon: 'local_fire_department',
      title: 'Streak King',
      subtitle: 'Consistency is the bridge to mastery',
      progressValue: 27,
      progressMax: 100,
      colorClass: 'text-tertiary',
    },
    {
      id: 'grammar-pro',
      icon: 'menu_book',
      title: 'Grammar Pro',
      subtitle: 'All N5 grammar particles completed',
      progressValue: 100,
      progressMax: 100,
      colorClass: 'text-secondary',
    },
  ],

  studyLog: [
    {
      id: 'log-1',
      icon: 'translate',
      iconColorClass: 'text-primary bg-primary/5',
      title: 'Advanced Kanji Radicals',
      subtitle: 'Unit 14 · Historical Context',
      date: 'Apr 3, 2026',
      duration: '45 min',
      status: 'completed',
      xp: 12,
    },
    {
      id: 'log-2',
      icon: 'headset',
      iconColorClass: 'text-tertiary bg-tertiary/5',
      title: 'NHK News Listening',
      subtitle: 'Natural Speed · Economy',
      date: 'Apr 2, 2026',
      duration: '20 min',
      status: 'completed',
      xp: 8,
    },
    {
      id: 'log-3',
      icon: 'menu_book',
      iconColorClass: 'text-secondary bg-secondary/5',
      title: 'Honorific Keigo Basics',
      subtitle: 'Polite Form Application',
      date: 'Apr 1, 2026',
      duration: '12 min',
      status: 'in-progress',
      xp: null,
    },
    {
      id: 'log-4',
      icon: 'quiz',
      iconColorClass: 'text-primary bg-primary/5',
      title: 'JLPT N3 Practice Quiz',
      subtitle: 'Mixed · Kanji & Grammar',
      date: 'Mar 31, 2026',
      duration: '30 min',
      status: 'completed',
      xp: 20,
    },
  ],

  streakCalendar: {
    activities:      _activities,
    currentStreak:   27,
    longestStreak:   _calStats.longestStreak,
    totalActiveDays: _calStats.totalActiveDays,
    thisWeekMinutes: _calStats.thisWeekMinutes,
  },
}
