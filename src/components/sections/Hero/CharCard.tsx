import { useEffect, useRef, useState } from 'react'

interface CharData {
  char: string
  romaji: string
  meaning: string
  type: string
  color: string
}

const CHARS: CharData[] = [
  { char: 'あ', romaji: 'a', meaning: 'Hiragana • First character', type: 'Hiragana', color: '#EA6B44' },
  { char: 'ア', romaji: 'a', meaning: 'Katakana • Same sound', type: 'Katakana', color: '#1C2B4B' },
  { char: '山', romaji: 'yama / san', meaning: 'Kanji • Mountain', type: 'Kanji', color: '#06a87e' },
  { char: 'ね', romaji: 'ne', meaning: 'Hiragana • Softens sentences', type: 'Hiragana', color: '#EA6B44' },
  { char: '愛', romaji: 'ai', meaning: 'Kanji • Love', type: 'Kanji', color: '#9333ea' },
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

  return (
    <div
      className="relative z-10 flex flex-col items-center justify-center rounded-[28px] border-2 border-outline-variant/40 overflow-hidden"
      style={{
        width: 300,
        height: 320,
        background: 'rgb(var(--surface-container-lowest))',
        boxShadow: '0 12px 40px rgba(28,43,75,0.18)',
        animation: 'charCardFloat 4s ease-in-out infinite',
      }}
    >
      {/* Header bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center gap-2 px-4 py-3"
        style={{ background: '#1C2B4B' }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-auto text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>
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
        className="font-headline font-bold leading-none transition-all duration-300"
        style={{
          fontSize: 100,
          color: c.color,
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.7) translateY(16px)',
        }}
      >
        {c.char}
      </div>

      {/* Romaji */}
      <p
        className="text-xl font-bold mt-1 transition-all duration-300"
        style={{ color: c.color, opacity: visible ? 1 : 0 }}
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
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 18 : 7,
              background: i === index ? c.color : 'rgb(var(--surface-container-high))',
            }}
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
