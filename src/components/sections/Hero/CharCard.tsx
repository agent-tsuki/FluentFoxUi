import { useEffect, useRef, useState } from 'react'

type ColorToken = 'primary' | 'secondary' | 'tertiary'

interface CharData {
  char: string
  romaji: string
  meaning: string
  type: string
  colorToken: ColorToken
}

// One accent token per character type — reuses the existing brand palette
// instead of inventing new hex values (see docs/UIUX_STANDARDS.md §0.2, §1).
const TOKEN_CLASSES: Record<ColorToken, { text: string; bg: string }> = {
  primary: { text: 'text-primary', bg: 'bg-primary' },
  secondary: { text: 'text-secondary', bg: 'bg-secondary' },
  tertiary: { text: 'text-tertiary', bg: 'bg-tertiary' },
}

const CHARS: CharData[] = [
  { char: 'あ', romaji: 'a', meaning: 'Hiragana • First character', type: 'Hiragana', colorToken: 'primary' },
  { char: 'ア', romaji: 'a', meaning: 'Katakana • Same sound', type: 'Katakana', colorToken: 'secondary' },
  { char: '山', romaji: 'yama / san', meaning: 'Kanji • Mountain', type: 'Kanji', colorToken: 'tertiary' },
  { char: 'ね', romaji: 'ne', meaning: 'Hiragana • Softens sentences', type: 'Hiragana', colorToken: 'primary' },
  { char: '愛', romaji: 'ai', meaning: 'Kanji • Love', type: 'Kanji', colorToken: 'tertiary' },
]

export function CharCard() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const charRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % CHARS.length)
        setVisible(true)
      }, 280)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  const c = CHARS[index]
  const colors = TOKEN_CLASSES[c.colorToken]

  return (
    <div
      className="relative z-10 flex flex-col items-center justify-center rounded-[28px] border-2 border-outline-variant/40 overflow-hidden shadow-elevation-3"
      style={{
        width: 300,
        height: 320,
        background: 'rgb(var(--surface-container-lowest))',
        animation: 'charCardFloat 4s ease-in-out infinite',
      }}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-3 bg-surface-inverse"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-auto text-[11px] font-bold text-on-surface-inverse-variant">
          {c.type}
        </span>
      </div>

      {/* Label */}
      <p className="mt-10 mb-1 text-[11px] font-bold tracking-[2px] uppercase text-on-surface-variant/60 font-label">
        Character of the Day
      </p>

      {/* Main character */}
      <div
        ref={charRef}
        className={`font-headline font-bold leading-none transition-all duration-300 ${colors.text}`}
        style={{
          fontSize: 100,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(16px)',
        }}
      >
        {c.char}
      </div>

      {/* Romaji */}
      <p
        className={`text-xl font-bold mt-1 transition-all duration-300 ${colors.text}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        {c.romaji}
      </p>

      {/* Meaning */}
      <p className="text-xs text-on-surface-variant mt-1 font-label" style={{ opacity: visible ? 1 : 0 }}>
        {c.meaning}
      </p>

      {/* Progress dots */}
      <div className="absolute bottom-4 flex gap-1.5">
        {CHARS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? colors.bg : 'bg-surface-container-high'}`}
            style={{ width: i === index ? 18 : 7 }}
          />
        ))}
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes charCardFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
      `}</style>
    </div>
  )
}
