import { EmptyState } from '@/components/ui/EmptyState'

/** The learn API serves N5 kanji only, so other levels have no quizzes or tests yet. */
export function KanjiTestsComingSoon({ levelLabel, onBack }: { levelLabel: string; onBack: () => void }) {
  return (
    <main className="min-h-dvh bg-surface pt-nav">
      <EmptyState
        icon="schedule"
        title={`${levelLabel} quizzes and tests are coming soon`}
        description="Quizzes and tests are saved to your account, and for now that works for N5 kanji."
        actionLabel="Back to the course"
        onAction={onBack}
      />
    </main>
  )
}
