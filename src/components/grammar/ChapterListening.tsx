import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SpeechVoice } from '@/api/services/audioService'
import { useChapterContent } from '@/hooks/useChapterContent'
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech'
import { usePreloadSpeech } from '@/hooks/usePreloadSpeech'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { Icon } from '@/components/ui/Icon'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { activeToken, parseRubyLine, romajiPieces, type RubyLine } from '@/lib/content/listening/rubyText'
import type { ChapterPassage } from '@/types/grammar'

/** How the Japanese is shown: normal (kanji and kana, as written), hiragana only, or not at all (listen by ear). */
type Script = 'normal' | 'hiragana' | 'hidden'

const SCRIPTS: { value: Script; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'hidden', label: 'Hide' },
]

/** Pause between lines while playing a whole passage, in seconds. */
const PAUSES = [0.5, 1, 2] as const

interface Line {
  ruby: RubyLine
  /** The text the voice speaks: as written, or the line's say where the engine misreads it. */
  say: string
  translation: string
  speaker?: number
  voice: SpeechVoice
}

interface Passage {
  kind: ChapterPassage['kind']
  title: string
  /** A dialogue's people, or a monologue's reader (when named). */
  speakers: RubyLine[]
  lines: Line[]
}

/**
 * Each line in its speaker's voice (a monologue in its reader's). Content from
 * an API without a cast falls back to the main voice and, in a dialogue, the
 * second voice for the second speaker.
 */
function toPassage(p: ChapterPassage): Passage {
  const voiceOf = (speaker: number | undefined): SpeechVoice => p.speaker_voices?.[speaker ?? 0] ?? (p.kind === 'dialogue' && speaker === 1 ? 'alt' : 'main')
  return {
    kind: p.kind,
    title: p.title,
    speakers: p.speakers.map(parseRubyLine),
    lines: p.lines.map((l) => ({
      ruby: parseRubyLine(l.text),
      say: l.say ?? parseRubyLine(l.text).spoken,
      translation: l.translation,
      speaker: l.speaker,
      voice: voiceOf(l.speaker),
    })),
  }
}

/** Each person in a scene keeps a colour (avatar and name); a dialogue has up to four. */
const SPEAKER_TONES = [
  { avatar: 'bg-primary/10 text-primary', name: 'text-primary' },
  { avatar: 'bg-secondary/15 text-secondary', name: 'text-secondary' },
  { avatar: 'bg-chart-4/15 text-chart-4', name: 'text-chart-4' },
  { avatar: 'bg-chart-5/15 text-chart-5', name: 'text-chart-5' },
]
const toneOf = (speaker: number | undefined) => SPEAKER_TONES[(speaker ?? 0) % SPEAKER_TONES.length]

/** The word to light up: punctuation has no highlight of its own, so the word before it stays lit. */
function litWord(line: RubyLine, token: number): number {
  let i = token
  while (i >= 0 && line.tokens[i]?.punct) i--
  return i
}

/** A speaker's initial for the avatar: kana as written, or the first kana of a kanji name (田中 → た). */
function initial(name: RubyLine | undefined): string {
  const first = name?.tokens[0]
  if (!first) return ''
  return first.parts[0]?.reading ? first.hiragana.charAt(0) : first.written.charAt(0)
}

const written = (line: RubyLine, script: Script) => line.tokens.map((t) => (script === 'hiragana' ? t.hiragana : t.written)).join('')

interface LineTextProps {
  ruby: RubyLine
  script: Script
  romaji: boolean
  /** The word being said, or -1 (none). */
  lit: number
  /** The line is playing: words before `lit` are shown as already said. */
  playing: boolean
  large?: boolean
}

/** A line in the chosen script, with romaji under it, the word being said highlighted in both. */
const LineText = memo(function LineText({ ruby, script, romaji, lit, playing, large = false }: LineTextProps) {
  const state = (i: number) => (i === lit ? 'rounded-md bg-primary/15 text-primary' : playing && i < lit ? 'text-primary' : undefined)
  return (
    <>
      <span lang="ja" className={cn('block font-ja leading-relaxed text-ink', large ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl')}>
        {ruby.tokens.map((t, i) => (
          <span key={i}>
            {/* Hiragana-only text is spaced by word, the way beginners' readers print it (and wraps at the spaces). */}
            {script === 'hiragana' && i > 0 && !t.punct && ' '}
            <span className={cn('transition-colors duration-100 motion-reduce:transition-none', state(i))}>
              {script === 'hiragana' ? t.hiragana : t.written}
            </span>
          </span>
        ))}
      </span>
      {romaji && (
        <span className="mt-0.5 block text-sm text-ink-muted">
          {romajiPieces(ruby.tokens).map((p, i) => {
            const space = p.text.startsWith(' ')
            return (
              <span key={i}>
                {space && ' '}
                <span className={cn('transition-colors duration-100 motion-reduce:transition-none', state(p.token))}>{space ? p.text.slice(1) : p.text}</span>
              </span>
            )
          })}
        </span>
      )}
    </>
  )
})

/**
 * A chapter's Listening tab: short dialogues and passages, read aloud. Each
 * person in a dialogue has their own voice, and the line being said is
 * marked; in a passage the word being said lights up as the audio plays. The Japanese can be shown as written, in hiragana only, or
 * hidden (listen by ear), with romaji and English under each line.
 */
export function ChapterListening({ level, chapterId }: { level: string; chapterId: number }) {
  const content = useChapterContent(level, chapterId)
  const passages = useMemo(() => (content.data?.passages ?? []).map(toPassage), [content.data])
  const [selected, setSelected] = useState(0)
  const passage = passages[Math.min(selected, passages.length - 1)] as Passage | undefined

  const { speak, supported, loadingText, progress } = useJapaneseSpeech()
  const [script, setScript] = useState<Script>('normal')
  const [romaji, setRomaji] = useState(false)
  const [english, setEnglish] = useState(false)
  const [pause, setPause] = useState<(typeof PAUSES)[number]>(1)

  /** The line last played or playing (where "play" continues from). */
  const [current, setCurrent] = useState<number | null>(null)
  /** The line whose audio is playing now, and the token being said. */
  const [speaking, setSpeaking] = useState<number | null>(null)
  const [token, setToken] = useState(-1)
  const [playingAll, setPlayingAll] = useState(false)
  /** A line whose voice has no recorded clip yet (it is played in no other voice). */
  const [missing, setMissing] = useState<number | null>(null)
  // Each run has its own number, so a stopped run ignores its late callbacks.
  const run = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  const rows = useRef<(HTMLLIElement | null)[]>([])

  const stop = useCallback(() => {
    run.current += 1
    window.clearTimeout(timer.current)
    setPlayingAll(false)
    setSpeaking(null)
    setToken(-1)
    setMissing(null)
  }, [])
  useEffect(() => stop, [stop])

  // Follow the voice: poll playback each frame while a line is playing.
  useEffect(() => {
    const line = speaking === null ? undefined : passage?.lines[speaking]
    // Only a passage lights up word by word; a conversation just marks whose line is playing.
    if (!line || passage?.kind !== 'monologue') return
    let frame = 0
    const tick = () => {
      const p = progress()
      if (p) setToken(activeToken(line.ruby, p.part, p.parts, p.fraction))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [speaking, passage, progress])

  const play = useCallback(
    (index: number, id: number, all: boolean) => {
      const line = passage?.lines[index]
      if (!line || id !== run.current) {
        if (id === run.current) setPlayingAll(false)
        return
      }
      setCurrent(index)
      setToken(-1)
      rows.current[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      let absent = false
      speak(line.say, {
        voice: line.voice,
        onStart: () => id === run.current && setSpeaking(index),
        onMissing: () => {
          absent = true
          if (id === run.current) setMissing(index)
        },
        onEnd: () => {
          if (id !== run.current) return
          setSpeaking(null)
          setToken(-1)
          // A conversation stops at a line with no audio rather than skip it.
          if (absent) setPlayingAll(false)
          else if (all) timer.current = window.setTimeout(() => play(index + 1, id, true), pause * 1000)
          else setPlayingAll(false)
        },
      })
    },
    [passage, speak, pause],
  )

  const playAll = () => {
    stop()
    setPlayingAll(true)
    const from = current !== null && passage && current < passage.lines.length - 1 ? current : 0
    play(from, run.current, true)
  }
  const playOne = (index: number) => {
    stop()
    play(index, run.current, false)
  }
  const choose = (index: number) => {
    stop()
    setCurrent(null)
    setSelected(index)
  }

  // The clips about to be heard, in their voices.
  const next = passage ? [passage.lines[current ?? 0], passage.lines[(current ?? -1) + 1]].filter(Boolean) : []
  usePreloadSpeech([next[0]?.say], next[0]?.voice)
  usePreloadSpeech([next[1]?.say], next[1]?.voice)

  if (content.isLoading || (!content.data && !content.error)) {
    return (
      <LoadingState label="Loading…" className="space-y-3 py-2">
        <SkeletonBlock className="h-10 w-2/3 rounded-md" />
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonBlock key={i} className={cn('h-20 rounded-xl', i % 2 ? 'ml-auto w-3/4' : 'w-3/4')} />
        ))}
      </LoadingState>
    )
  }
  if (content.error) {
    return (
      <div className="py-2">
        <ErrorState message="We couldn't load this chapter." onRetry={content.refetch} />
      </div>
    )
  }
  if (!supported || !passage) {
    return (
      <div className="py-2">
        <EmptyState
          icon="headphones"
          title={supported ? 'Nothing to listen to here yet' : 'Audio isn’t available here'}
          description={supported ? 'Dialogues for this chapter are being added.' : 'This browser can’t play the voice clips. Try another browser.'}
        />
      </div>
    )
  }

  const dialogue = passage.kind === 'dialogue'
  const lineProps = (index: number) => ({
    ruby: passage.lines[index].ruby,
    script,
    romaji: romaji && script !== 'hidden',
    lit: speaking === index && !dialogue ? litWord(passage.lines[index].ruby, token) : -1,
    playing: speaking === index,
  })
  const speakerIcon = (index: number) => (
    <Icon
      name={loadingText === passage.lines[index].say ? 'progress_activity' : 'volume_up'}
      className={cn('text-base', loadingText === passage.lines[index].say && 'animate-spin motion-reduce:animate-none')}
    />
  )

  return (
    <div className="pb-2">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Listen and read</h1>
      <p className="mt-1 max-w-prose text-sm text-ink-muted">
        Short conversations and passages using this chapter’s words. In a passage each word lights up as it is said; tap a line to hear it again.
      </p>

      {passages.length > 1 && (
        <div role="radiogroup" aria-label="Passage" className="mt-5 flex flex-wrap gap-2">
          {passages.map((p, i) => {
            const on = p === passage
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(i)}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  on
                    ? 'border-ink bg-ink text-surface'
                    : 'border-line text-ink-muted hover:text-ink',
                )}
              >
                <Icon name={p.kind === 'dialogue' ? 'forum' : 'auto_stories'} className="text-lg" />
                {p.title}
              </button>
            )
          })}
        </div>
      )}

      <section aria-label={passage.title} className="mt-6">
        {dialogue ? (
          <ol className="space-y-3">
            {passage.lines.map((line, i) => {
              // The second person sits on the right, as in a chat; everyone else on the left.
              const right = line.speaker === 1
              const name = passage.speakers[line.speaker ?? 0]
              const tone = toneOf(line.speaker)
              const on = current === i
              return (
                <li
                  key={i}
                  ref={(el) => {
                    rows.current[i] = el
                  }}
                  className={cn('flex items-end gap-2.5', right && 'flex-row-reverse')}
                >
                  <span
                    aria-hidden
                    lang="ja"
                    className={cn('mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-ja text-sm font-bold', tone.avatar)}
                  >
                    {initial(name)}
                  </span>
                  <button
                    type="button"
                    onClick={() => playOne(i)}
                    aria-current={on ? 'true' : undefined}
                    className={cn(
                      'min-w-0 max-w-[85%] rounded-3xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-[75%]',
                      right ? 'rounded-br-md' : 'rounded-bl-md',
                      on
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-line bg-surface-raised hover:bg-surface-hover',
                    )}
                  >
                    <span className={cn('mb-1 flex items-center gap-1.5 text-xs font-semibold', tone.name)}>
                      <span lang="ja" className="font-ja">
                        {name && written(name, script === 'hiragana' ? 'hiragana' : 'normal')}
                      </span>
                      <span className="text-ink-muted">{speakerIcon(i)}</span>
                    </span>
                    {script === 'hidden' ? (
                      <span className="block text-sm text-ink-muted">Line {i + 1} — listen</span>
                    ) : (
                      <LineText {...lineProps(i)} />
                    )}
                    {english && <span className="mt-1 block text-sm italic text-ink-muted">{line.translation}</span>}
                    <span className="sr-only">Play this line</span>
                  </button>
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="rounded-3xl border border-line bg-surface-raised p-3 sm:p-5">
            {passage.speakers[0] && (
              <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold text-ink-muted">
                <span
                  aria-hidden
                  lang="ja"
                  className={cn('flex h-7 w-7 items-center justify-center rounded-full font-ja text-xs font-bold', SPEAKER_TONES[0].avatar)}
                >
                  {initial(passage.speakers[0])}
                </span>
                <span>
                  Read by{' '}
                  <span lang="ja" className="font-ja">
                    {written(passage.speakers[0], script === 'hiragana' ? 'hiragana' : 'normal')}
                  </span>
                </span>
              </p>
            )}
            <ol>
              {passage.lines.map((line, i) => (
                <li
                  key={i}
                  ref={(el) => {
                    rows.current[i] = el
                  }}
                >
                  <button
                    type="button"
                    onClick={() => playOne(i)}
                    aria-current={current === i ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      current === i ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-surface-hover',
                    )}
                  >
                    <span aria-hidden className="mt-1.5 text-ink-muted">
                      {speakerIcon(i)}
                    </span>
                    <span className="min-w-0 flex-1">
                      {script === 'hidden' ? (
                        <span className="block py-1 text-sm text-ink-muted">Sentence {i + 1} — listen</span>
                      ) : (
                        <LineText {...lineProps(i)} large />
                      )}
                      {english && <span className="mt-1 block text-sm italic text-ink-muted">{line.translation}</span>}
                    </span>
                    <span className="sr-only">Play this sentence</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <StatusMessage
        tone="error"
        className="mt-6"
        message={
          missing === null
            ? ''
            : `Line ${missing + 1}’s voice isn’t recorded yet, so it can’t be played. Its audio is being prepared; please try again later.`
        }
      />

      {/* The player: under the text, and kept in view while reading a long passage. */}
      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-10 mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-1 rounded-xl border border-line bg-surface/95 px-2.5 py-2 shadow-lg backdrop-blur sm:gap-x-4 sm:px-4 sm:py-2.5">
        <Button onClick={playingAll ? stop : playAll} className="flex min-h-11 items-center gap-1.5 !px-3 !py-1.5 sm:gap-2 sm:!px-4">
          <Icon name={playingAll ? 'close' : 'play_circle'} className="text-xl" />
          {playingAll ? (
            'Stop'
          ) : (
            <>
              Play
              <span className="hidden sm:inline">
                {current !== null && current < passage.lines.length - 1 ? ' from here' : dialogue ? ' conversation' : ' passage'}
              </span>
            </>
          )}
        </Button>
        <div role="radiogroup" aria-label="Show the Japanese as" className="flex gap-0.5 rounded-full bg-surface-sunken p-1 sm:gap-1">
          {SCRIPTS.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={script === s.value}
              onClick={() => setScript(s.value)}
              className={cn(
                'min-h-9 rounded-full px-2 text-sm font-semibold transition-colors sm:px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                script === s.value ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-x-4">
          <Switch checked={romaji} onChange={setRomaji} label="Romaji" disabled={script === 'hidden'} />
          <Switch checked={english} onChange={setEnglish} label="English" />
        </div>
        <label className="flex items-center gap-1.5 text-sm text-ink-muted sm:gap-2">
          <Icon name="timer" className="text-lg sm:hidden" />
          <span className="sr-only sm:not-sr-only">Pause</span>
          <select
            value={pause}
            onChange={(e) => setPause(Number(e.target.value) as (typeof PAUSES)[number])}
            className="min-h-10 rounded-sm border border-line bg-surface-raised px-1.5 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-2"
          >
            {PAUSES.map((p) => (
              <option key={p} value={p}>
                {p} s
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
