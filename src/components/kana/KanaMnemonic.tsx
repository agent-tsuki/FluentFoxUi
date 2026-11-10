import { Icon } from '@/components/ui/Icon'
import { useKanaScript } from '@/context/KanaScriptContext'
import { SpeakerButton } from '@/components/kana/SpeakerButton'
import type { KanaChar } from '@/types'

interface KanaMnemonicProps {
  char: KanaChar
  /** Speech callback; omitted when the browser has no Japanese voice. */
  onSpeak?: (text: string) => void
  /** Text whose clip is still loading (from useJapaneseSpeech), for the example's spinner. */
  loadingText?: string | null
}

/** KanaMnemonic — one-line memory hint plus the kana's example word. */
export function KanaMnemonic({ char, onSpeak, loadingText }: KanaMnemonicProps) {
  const script = useKanaScript()
  const hint = script.memoryHint(char.character, char.romaji)
  const sample = script.sampleWords[char.id] ?? script.sampleWords[char.romaji]
  // "すし (sushi)" → kana "すし", reading "sushi"
  const match = sample?.word.match(/^(.+?)\s*\((.+)\)$/)
  const kana = match?.[1] ?? sample?.word
  const reading = match?.[2]

  if (!hint && !sample) return null

  return (
    <div className="space-y-3">
      {hint && (
        <p className="flex gap-3 text-base leading-relaxed text-ink">
          <Icon name="lightbulb" className="mt-0.5 shrink-0 text-xl text-primary" />
          <span>{hint}</span>
        </p>
      )}
      {sample && kana && (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-sunken p-3 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">Example</p>
            <p className="mt-0.5 text-lg text-ink">
              <span lang="ja" className="font-ja-display font-bold">{kana}</span>
              {reading && <span className="ml-2 text-sm text-ink-muted">{reading}</span>}
            </p>
            <p className="text-sm text-ink-muted">{sample.meaning}</p>
          </div>
          {onSpeak && <SpeakerButton onClick={() => onSpeak(kana)} label={`Play ${reading ?? kana}`} loading={loadingText === kana} />}
        </div>
      )}
    </div>
  )
}
