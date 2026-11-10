import { memo, useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SelectInput } from '@/components/ui/FormField'
import { voiceKeyLabel, voiceName } from '@/lib/admin/audio'
import type { AdminVoice, EngineSpeaker } from '@/types/audioAdmin'

interface VoiceRowProps {
  voice: AdminVoice
  speakers: readonly EngineSpeaker[]
  /** The key of the action in flight, e.g. "save:f1". */
  busy: string | null
  onPreview: (styleId: number) => void
  onSave: (key: string, styleId: number) => void
  onGenerate: (key: string) => void
}

/** One voice key: its current voice and clip coverage, and a style picker to hear and save another. */
export const VoiceRow = memo(function VoiceRow({ voice, speakers, busy, onPreview, onSave, onGenerate }: VoiceRowProps) {
  const selectId = useId()
  const [choice, setChoice] = useState<number | null>(voice.styleId ?? null)
  const changed = choice !== null && choice !== voice.styleId
  const missing = voice.clips - voice.ready
  const complete = voice.clips > 0 && missing === 0

  return (
    <li className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="rounded-md bg-surface-hover px-2 py-0.5 font-mono text-xs font-bold text-ink">{voice.key}</span>
          <span className="text-sm font-semibold text-ink">{voiceKeyLabel(voice.key)}</span>
        </div>
        <p className="truncate text-sm text-ink-muted" lang="ja">
          {voiceName(voice)}
        </p>
        <div className="space-y-1">
          <ProgressBar
            value={voice.ready}
            max={Math.max(1, voice.clips)}
            label={`${voice.key} clips ready`}
            valueText={`${voice.ready} of ${voice.clips} clips`}
            tone={complete ? 'success' : 'primary'}
          />
          <p className="text-xs text-ink-muted">
            {voice.clips === 0
              ? 'No course text uses this voice.'
              : complete
                ? `All ${voice.clips} clips ready`
                : `${voice.ready} of ${voice.clips} clips ready · ${missing} missing`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={selectId} className="sr-only">
          Voice for {voice.key}
        </label>
        <SelectInput
          id={selectId}
          className="min-w-0 flex-1 basis-56"
          value={choice ?? ''}
          disabled={speakers.length === 0}
          onChange={(e) => setChoice(e.target.value === '' ? null : Number(e.target.value))}
        >
          <option value="" disabled>
            {speakers.length ? 'Choose a voice…' : 'Engine not reachable'}
          </option>
          {speakers.map((sp) => (
            <optgroup key={sp.speakerUuid} label={sp.name}>
              {sp.styles.map((st) => (
                <option key={st.id} value={st.id}>
                  {sp.name} · {st.name}
                </option>
              ))}
            </optgroup>
          ))}
        </SelectInput>
        <Button
          variant="outline"
          className="flex min-h-11 items-center gap-1.5 !px-3 !py-2 text-sm"
          disabled={choice === null || busy === `preview:${choice}`}
          onClick={() => choice !== null && onPreview(choice)}
          aria-label={`Preview this voice for ${voice.key}`}
        >
          <Icon name={busy === `preview:${choice}` ? 'progress_activity' : 'play_circle'} className="text-lg" />
          Preview
        </Button>
        <Button
          className="flex min-h-11 items-center gap-1.5 !px-3 !py-2 text-sm"
          disabled={!changed || busy === `save:${voice.key}`}
          onClick={() => choice !== null && onSave(voice.key, choice)}
        >
          <Icon name="check" className="text-lg" />
          Save
        </Button>
        <Button
          variant="ghost"
          className="flex min-h-11 items-center gap-1.5 !px-3 !py-2 text-sm"
          disabled={complete || voice.clips === 0 || busy === `generate:${voice.key}`}
          onClick={() => onGenerate(voice.key)}
        >
          <Icon name="volume_up" className="text-lg" />
          Generate missing
        </Button>
      </div>
    </li>
  )
})
