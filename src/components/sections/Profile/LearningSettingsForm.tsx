import type { ReactNode } from 'react'
import type { AnswerMode, ChapterCompletion, LearningSettings } from '@/types/learn'
import { cn } from '@/lib/cn'
import {
  ANSWER_MODES,
  ANSWER_MODE_TEXT,
  SETTING_RANGES,
  formatHour,
  percentToRetention,
  retentionToPercent,
  type NumericSettingKey,
  type SettingsErrors,
} from '@/lib/learn/learningSettings'
import { SettingNumberField } from './SettingNumberField'
import { SettingToggle } from './SettingToggle'

interface LearningSettingsFormProps {
  draft: LearningSettings
  errors: SettingsErrors
  onChange: <K extends keyof LearningSettings>(key: K, value: LearningSettings[K]) => void
}

const COUNT_FIELDS: readonly { key: NumericSettingKey; label: string; hint: string; unit: string }[] = [
  { key: 'daily_goal_answers', label: 'Daily goal', hint: 'Answers that count the day for your streak', unit: 'answers' },
  { key: 'new_kana_per_day', label: 'New kana per day', hint: 'Hiragana and katakana share this limit', unit: 'kana' },
  { key: 'new_kanji_per_day', label: 'New kanji per day', hint: 'New kanji lessons may add', unit: 'kanji' },
  { key: 'max_reviews_per_day', label: 'Max reviews per day', hint: 'Review answers before the queue waits for tomorrow', unit: 'reviews' },
  { key: 'session_size', label: 'Review session size', hint: 'Cards in one review session', unit: 'cards' },
  { key: 'lesson_size', label: 'Lesson size', hint: 'New items taught in one lesson', unit: 'items' },
]

const SELECT_CLASS =
  'w-full min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-base text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/** The pass marks offered, plus the learner's own if it is another value the server allows. */
const PASS_MARKS = [60, 70, 80, 90] as const
function passMarks(current: number): number[] {
  return [...new Set<number>([...PASS_MARKS, current])].sort((a, b) => a - b)
}

const CHAPTER_COMPLETIONS: readonly { value: ChapterCompletion; label: string; hint: string }[] = [
  { value: 'auto', label: 'Automatically when I pass the exercise', hint: 'Passing a chapter’s exercise ticks it off.' },
  { value: 'manual', label: 'I’ll mark chapters myself', hint: 'Use “Mark complete” on a chapter; passing the exercise only records your score.' },
]

const HOURS = Array.from({ length: SETTING_RANGES.day_starts_at_hour.max + 1 }, (_, h) => h)

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <div className="px-6 md:px-8 py-6 border-b border-outline-variant">
        <h2 className="text-lg font-bold text-on-surface font-headline">{title}</h2>
        <p className="text-xs text-on-surface-variant font-body mt-0.5">{description}</p>
      </div>
      <div className="px-6 md:px-8 py-6 space-y-6">{children}</div>
    </div>
  )
}

/** The editable fields of Settings → Learning and Advanced. State lives in the parent. */
export function LearningSettingsForm({ draft, errors, onChange }: LearningSettingsFormProps) {
  const retention = SETTING_RANGES.desired_retention
  return (
    <div className="space-y-6">
      <Panel title="Learning" description="Daily limits, session sizes and how you answer">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {COUNT_FIELDS.map(({ key, label, hint, unit }) => (
            <SettingNumberField
              key={key}
              label={label}
              hint={hint}
              unit={unit}
              value={draft[key]}
              {...SETTING_RANGES[key]}
              error={errors[key]}
              onChange={(v) => onChange(key, v)}
            />
          ))}
          <div className="space-y-1.5">
            <label htmlFor="day-start-hour" className="block text-sm font-semibold text-on-surface font-body">
              Day starts at
            </label>
            <select
              id="day-start-hour"
              value={draft.day_starts_at_hour}
              onChange={(e) => onChange('day_starts_at_hour', Number(e.target.value))}
              className="w-28 min-h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-base text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant font-body">Late-night answers before this hour count for the day before</p>
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-on-surface font-body mb-2">Answer mode</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ANSWER_MODES.map((mode) => (
              <AnswerModeOption key={mode} mode={mode} checked={draft.answer_mode === mode} onSelect={() => onChange('answer_mode', mode)} />
            ))}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <label htmlFor="target-retention" className="flex items-center justify-between text-sm font-semibold text-on-surface font-body">
            Target recall
            <span className="tabular-nums text-primary">{retentionToPercent(draft.desired_retention)} %</span>
          </label>
          <input
            id="target-retention"
            type="range"
            min={retentionToPercent(retention.min)}
            max={retentionToPercent(retention.max)}
            step={1}
            value={retentionToPercent(draft.desired_retention)}
            onChange={(e) => onChange('desired_retention', percentToRetention(Number(e.target.value)))}
            className="w-full accent-primary min-h-11"
          />
          <p className={cn('text-xs font-body', errors.desired_retention ? 'text-error' : 'text-on-surface-variant')}>
            {errors.desired_retention ?? 'How likely you should be to remember a card when it comes back. Higher means more reviews.'}
          </p>
        </div>
      </Panel>

      <Panel title="Grammar chapters" description="When a chapter's vocab quiz and exercise pass, and who marks a chapter complete">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="chapter-pass-mark" className="block text-sm font-semibold text-on-surface font-body">
              Pass mark
            </label>
            <select
              id="chapter-pass-mark"
              value={draft.chapter_pass_pct}
              onChange={(e) => onChange('chapter_pass_pct', Number(e.target.value))}
              className={SELECT_CLASS}
            >
              {passMarks(draft.chapter_pass_pct).map((pct) => (
                <option key={pct} value={pct}>
                  {pct}%
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant font-body">Share of questions a chapter&rsquo;s vocab quiz or exercise needs right</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="chapter-completion" className="block text-sm font-semibold text-on-surface font-body">
              Completing a chapter
            </label>
            <select
              id="chapter-completion"
              value={draft.chapter_completion}
              onChange={(e) => onChange('chapter_completion', e.target.value as ChapterCompletion)}
              className={SELECT_CLASS}
            >
              {CHAPTER_COMPLETIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface-variant font-body">
              {CHAPTER_COMPLETIONS.find((c) => c.value === draft.chapter_completion)?.hint}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Advanced" description="Optional numbers on your dashboard">
        <SettingToggle
          icon="insights"
          label="Show retention"
          description="Show your recall against your target on the dashboard"
          checked={draft.show_retention}
          onChange={(v) => onChange('show_retention', v)}
        />
      </Panel>
    </div>
  )
}

function AnswerModeOption({ mode, checked, onSelect }: { mode: AnswerMode; checked: boolean; onSelect: () => void }) {
  const text = ANSWER_MODE_TEXT[mode]
  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col gap-1 rounded-xl border-[1.5px] p-3 transition-colors focus-within:ring-2 focus-within:ring-primary',
        checked ? 'border-primary bg-primary/[0.08]' : 'border-outline-variant/60 hover:border-primary/50',
      )}
    >
      <span className="flex items-center gap-2 text-sm font-bold text-on-surface font-label">
        <input type="radio" name="answer-mode" value={mode} checked={checked} onChange={onSelect} className="accent-primary" />
        {text.label}
      </span>
      <span className="text-xs text-on-surface-variant font-body">{text.hint}</span>
    </label>
  )
}
