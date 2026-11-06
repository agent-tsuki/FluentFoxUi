import { asset } from '@/lib/assets'

type VisualKind = 'comparison' | 'direction' | 'exchange' | 'range' | 'sequence' | 'space'
type Tone = 'amber' | 'blue' | 'coral' | 'moss' | 'plum'

interface VisualItem {
  label: string
  note: string
  tone: Tone
}

interface VisualSpec {
  kind: VisualKind
  eyebrow: string
  title: string
  caption: string
  items: VisualItem[]
  scene?: {
    src: string
    alt: string
    caption: string
  }
  /**
   * Illustrated board (transparent WebP) that replaces the coded diagram box.
   * `src` is a public/ path; asset() maps it to the hashed CDN copy. Without `alt`, the alt text is built from `items`, so it always
   * spells out every Japanese word on the board.
   */
  illustration?: {
    src: string
    alt?: string
    /** The full example sentence the board teaches; the Japanese is built from `items`. */
    romaji: string
    meaning: string
  }
}

const toneChip = 'border-tone/35 bg-tone-soft text-tone-ink'

const tones: Record<Tone, { chip: string; dot: string }> = {
  amber: { chip: `diagram-tone-amber ${toneChip}`, dot: 'bg-tone' },
  blue: { chip: `diagram-tone-blue ${toneChip}`, dot: 'bg-tone' },
  coral: { chip: `diagram-tone-coral ${toneChip}`, dot: 'bg-tone' },
  moss: { chip: `diagram-tone-moss ${toneChip}`, dot: 'bg-tone' },
  plum: { chip: `diagram-tone-plum ${toneChip}`, dot: 'bg-tone' },
}

// Grammar patterns use code-native diagrams for precise, selectable Japanese.
// A few concepts also receive a text-free contextual scene when real-world context
// makes the grammar easier to grasp than another abstract diagram would.
const visuals: Record<number, VisualSpec> = {
  1: {
    kind: 'sequence', eyebrow: 'Sentence builder', title: 'A polite identity sentence',
    caption: 'Japanese marks the topic, then closes the idea politely.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_one.webp',
      alt: 'Sentence builder board: わたし (topic) → は (topic marker) → 学生 (identity) → です (polite close), with Fox Sensei pointing at は.',
      romaji: 'Watashi wa gakusei desu.',
      meaning: 'I am a student.',
    },
    items: [
      { label: 'わたし', note: 'topic', tone: 'moss' },
      { label: 'は', note: 'topic marker', tone: 'coral' },
      { label: '学生', note: 'identity', tone: 'blue' },
      { label: 'です', note: 'polite close', tone: 'plum' },
    ],
  },
  2: {
    kind: 'range', eyebrow: 'Distance map', title: 'Choose by distance',
    caption: 'The object changes name based on whose zone it is in.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_two.webp',
      alt: 'Distance map board: これ (near me), それ (near you), あれ (far from both), with a dotted line showing growing distance and Fox Sensei pointing at これ.',
      romaji: 'kore · sore · are',
      meaning: 'this one · that one (by you) · that one over there',
    },
    scene: {
      src: '/images/grammar/n5/scenes/demonstrative-distance-scene.webp',
      alt: 'Two friends at a café with a red notebook near one person, a blue notebook near the other, and a yellow umbrella farther away.',
      caption: 'Picture the red notebook as これ, the blue notebook as それ, and the distant umbrella as あれ.',
    },
    items: [
      { label: 'これ', note: 'near me', tone: 'moss' },
      { label: 'それ', note: 'near you', tone: 'blue' },
      { label: 'あれ', note: 'far from us both', tone: 'coral' },
    ],
  },
  3: {
    kind: 'range', eyebrow: 'Location map', title: 'Point to a place',
    caption: 'The same distance pattern works for locations and polite directions.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_three.webp',
      romaji: 'koko · soko · asoko',
      meaning: 'here · there (by you) · over there',
    },
    items: [
      { label: 'ここ', note: 'here · near me', tone: 'moss' },
      { label: 'そこ', note: 'there · near you', tone: 'blue' },
      { label: 'あそこ', note: 'over there', tone: 'coral' },
    ],
  },
  4: {
    kind: 'sequence', eyebrow: 'Time line', title: 'Put the time before the action',
    caption: 'Use に for an exact time, then finish with the action.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_four.webp',
      romaji: 'Shichi-ji ni okimasu. Hachi-ji ni ikimasu.',
      meaning: 'I wake up at seven. I leave at eight.',
    },
    items: [
      { label: '7時に', note: 'at seven', tone: 'amber' },
      { label: 'おきます', note: 'wake up', tone: 'moss' },
      { label: '8時に', note: 'at eight', tone: 'amber' },
      { label: '行きます', note: 'go', tone: 'blue' },
    ],
  },
  5: {
    kind: 'sequence', eyebrow: 'Travel route', title: 'Destination · transport · companion',
    caption: 'A journey sentence can show where, how, and with whom you go.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_five.webp',
      romaji: 'Ie kara densha de gakkō e (ikimasu).',
      meaning: 'I go from home to school by train.',
    },
    items: [
      { label: '家から', note: 'from home', tone: 'moss' },
      { label: '電車で', note: 'by train', tone: 'blue' },
      { label: '学校へ', note: 'to school', tone: 'coral' },
    ],
  },
  6: {
    kind: 'sequence', eyebrow: 'Object link', title: 'An action needs an object',
    caption: 'を links the thing you act on to the verb.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_six.webp',
      romaji: 'Watashi wa ringo o tabemasu.',
      meaning: 'I eat an apple.',
    },
    items: [
      { label: 'わたしは', note: 'topic', tone: 'moss' },
      { label: 'りんごを', note: 'object', tone: 'coral' },
      { label: '食べます', note: 'action', tone: 'blue' },
    ],
  },
  7: {
    kind: 'exchange', eyebrow: 'Giving direction', title: 'Follow the gift',
    caption: 'The arrow tells you who gives and who receives.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_seven.webp',
      romaji: 'Watashi wa tomodachi ni purezento o agemasu.',
      meaning: 'I give my friend a present.',
    },
    scene: {
      src: '/images/grammar/n5/scenes/giving-receiving-scene.webp',
      alt: 'One friend gives a wrapped present to another friend in a park.',
      caption: 'First, follow the gift. Then choose the verb from the giver’s point of view.',
    },
    items: [
      { label: 'わたし', note: 'giver', tone: 'moss' },
      { label: 'プレゼント', note: 'gift', tone: 'amber' },
      { label: '友だち', note: 'receiver', tone: 'blue' },
    ],
  },
  8: {
    kind: 'comparison', eyebrow: 'Adjective families', title: 'Two ways to describe',
    caption: 'I-adjectives end in い; na-adjectives need な before a noun.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_eight.webp',
      romaji: 'takai · shizuka (na)',
      meaning: 'expensive / tall · quiet',
    },
    items: [
      { label: '高い', note: 'i-adjective', tone: 'coral' },
      { label: '静か（な）', note: 'na-adjective', tone: 'plum' },
    ],
  },
  9: {
    kind: 'sequence', eyebrow: 'Reason chain', title: 'A feeling leads to a reason',
    caption: 'Use から to connect the reason with the result.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_nine.webp',
      romaji: 'Nihongo ga suki desu kara…',
      meaning: 'Because I like Japanese…',
    },
    items: [
      { label: '日本語が', note: 'Japanese', tone: 'blue' },
      { label: '好きです', note: 'I like it', tone: 'moss' },
      { label: 'から', note: 'because', tone: 'coral' },
    ],
  },
  10: {
    kind: 'space', eyebrow: 'Room map', title: 'Describe where something is',
    caption: 'Position words show the relationship between two things.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_ten.webp',
      romaji: 'tsukue · ue · shita · tonari',
      meaning: 'desk · on top · under · next to',
    },
    items: [
      { label: 'つくえ', note: 'the reference', tone: 'moss' },
      { label: 'うえ', note: 'on top', tone: 'amber' },
      { label: 'した', note: 'under', tone: 'blue' },
      { label: 'となり', note: 'next to', tone: 'coral' },
    ],
  },
  11: {
    kind: 'range', eyebrow: 'Counter guide', title: 'The counter matches the thing',
    caption: 'Japanese counts objects by category, not with one universal ending.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_eleven.webp',
      romaji: 'hitotsu · futari · sanbon',
      meaning: 'one thing · two people · three long things',
    },
    items: [
      { label: '一つ', note: 'general things', tone: 'moss' },
      { label: '二人', note: 'people', tone: 'blue' },
      { label: '三本', note: 'long things', tone: 'coral' },
    ],
  },
  12: {
    kind: 'comparison', eyebrow: 'Comparison scale', title: 'Choose the side you prefer',
    caption: 'A のほうが B より adjective says A is more adjective than B.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twelve.webp',
      romaji: 'Ringo no hō ga budō yori suki desu.',
      meaning: 'I like apples more than grapes.',
    },
    items: [
      { label: 'りんご', note: 'A', tone: 'coral' },
      { label: 'ぶどう', note: 'B', tone: 'plum' },
    ],
  },
  13: {
    kind: 'sequence', eyebrow: 'Purpose route', title: 'Go somewhere to do something',
    caption: 'The movement has a destination and a purpose.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_thirteen.webp',
      romaji: 'Depāto e kutsu o kai ni ikimasu.',
      meaning: 'I go to the department store to buy shoes.',
    },
    scene: {
      src: '/images/grammar/n5/scenes/travel-purpose-scene.webp',
      alt: 'A person walks from a train platform toward a department store with shoes in the window.',
      caption: 'The train explains how they travel; the shoe shop explains why they go.',
    },
    items: [
      { label: 'デパートへ', note: 'destination', tone: 'blue' },
      { label: 'くつを買いに', note: 'purpose', tone: 'amber' },
      { label: '行きます', note: 'movement', tone: 'moss' },
    ],
  },
  14: {
    kind: 'sequence', eyebrow: 'Verb transformation', title: 'Turn a verb into て-form',
    caption: 'The て-form opens the door to requests and ongoing actions.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_fourteen.webp',
      romaji: 'yomimasu → yonde kudasai',
      meaning: 'read → please read',
    },
    items: [
      { label: '読みます', note: 'polite verb', tone: 'blue' },
      { label: '読んで', note: 'te-form', tone: 'coral' },
      { label: 'ください', note: 'please', tone: 'moss' },
    ],
  },
  15: {
    kind: 'comparison', eyebrow: 'Rule signal', title: 'Permission or prohibition?',
    caption: 'The same て-form changes meaning with the ending that follows it.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_fifteen.webp',
      romaji: 'mite mo ii · mite wa ikenai',
      meaning: 'you may look · you must not look',
    },
    items: [
      { label: '見ても いい', note: 'permission', tone: 'moss' },
      { label: '見ては いけない', note: 'not allowed', tone: 'coral' },
    ],
  },
  16: {
    kind: 'sequence', eyebrow: 'Verb transformation', title: 'Build a negative verb',
    caption: 'The ない-form is the base for “do not” and “must”.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_sixteen.webp',
      romaji: 'taberu → tabenai → tabenaide kudasai',
      meaning: 'eat → not eat → please don’t eat',
    },
    items: [
      { label: '食べる', note: 'dictionary form', tone: 'blue' },
      { label: '食べない', note: 'nai-form', tone: 'coral' },
      { label: 'ないでください', note: 'please do not', tone: 'moss' },
    ],
  },
  17: {
    kind: 'sequence', eyebrow: 'Ability shift', title: 'From doing to being able to do',
    caption: 'Potential form changes the action into an ability.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_seventeen.webp',
      romaji: 'yomu → yomeru · dekimasu',
      meaning: 'read → can read · be able to',
    },
    items: [
      { label: '読む', note: 'read', tone: 'blue' },
      { label: '読める', note: 'can read', tone: 'moss' },
      { label: 'できます', note: 'be able to', tone: 'coral' },
    ],
  },
  18: {
    kind: 'sequence', eyebrow: 'Experience line', title: 'Connect a past event to now',
    caption: 'A past action plus ことが あります expresses life experience.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_eighteen.webp',
      romaji: 'Nihon e itta koto ga arimasu.',
      meaning: 'I have been to Japan.',
    },
    scene: {
      src: '/images/grammar/n5/scenes/experience-scene.webp',
      alt: 'A traveller pauses with a camera at a mountain shrine path beneath a torii gate in Japan.',
      caption: 'One memorable visit becomes an experience you can talk about now.',
    },
    items: [
      { label: '日本へ 行った', note: 'past event', tone: 'blue' },
      { label: 'ことが', note: 'experience marker', tone: 'amber' },
      { label: 'あります', note: 'have experienced', tone: 'moss' },
    ],
  },
  20: {
    kind: 'sequence', eyebrow: 'Noun lens', title: 'Put the description before the noun',
    caption: 'Japanese places the whole describing sentence before what it describes.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty.webp',
      romaji: 'Kinō katta hon o yomimasu.',
      meaning: 'I read the book I bought yesterday.',
    },
    items: [
      { label: '昨日 買った', note: 'description', tone: 'blue' },
      { label: '本', note: 'noun', tone: 'amber' },
      { label: 'を 読みます', note: 'main action', tone: 'moss' },
    ],
  },
  21: {
    kind: 'sequence', eyebrow: 'Natural result', title: 'One event triggers another',
    caption: 'Use と for a reliable consequence or automatic result.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty_one.webp',
      romaji: 'Botan o osu to doa ga aku.',
      meaning: 'When you press the button, the door opens.',
    },
    items: [
      { label: 'ボタンを 押す', note: 'trigger', tone: 'coral' },
      { label: 'と', note: 'then', tone: 'amber' },
      { label: 'ドアが 開く', note: 'natural result', tone: 'moss' },
    ],
  },
  22: {
    kind: 'sequence', eyebrow: 'Conditional path', title: 'If this happens, then…',
    caption: 'たら sets the condition before the result or advice.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty_two.webp',
      romaji: 'Ame ga futtara kasa o mochimasu.',
      meaning: 'If it rains, I take an umbrella.',
    },
    scene: {
      src: '/images/grammar/n5/scenes/condition-rain-scene.webp',
      alt: 'A person reaches for an umbrella in an entryway while rain falls outside.',
      caption: 'Rain is the condition; taking the umbrella is the response.',
    },
    items: [
      { label: '雨が 降ったら', note: 'if it rains', tone: 'blue' },
      { label: 'かさを', note: 'umbrella', tone: 'amber' },
      { label: '持ちます', note: 'take it', tone: 'moss' },
    ],
  },
  23: {
    kind: 'direction', eyebrow: 'Direction lens', title: 'Change the viewpoint, change the verb',
    caption: 'Giving and receiving verbs follow the direction of the benefit.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty_three.webp',
      romaji: 'agemasu · moraimasu',
      meaning: 'I give · I receive',
    },
    items: [
      { label: 'わたし → 友だち', note: 'I give · あげます', tone: 'moss' },
      { label: '友だち → わたし', note: 'I receive · もらいます', tone: 'blue' },
    ],
  },
  24: {
    kind: 'sequence', eyebrow: 'Potential form', title: 'See ability as a new verb',
    caption: 'Potential form can describe ability, what is visible, or what is audible.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty_four.webp',
      romaji: 'yomu → yomeru · shika nai',
      meaning: 'read → can read · only',
    },
    items: [
      { label: '読む', note: 'action', tone: 'blue' },
      { label: '読める', note: 'potential', tone: 'moss' },
      { label: 'しか ない', note: 'only / limitation', tone: 'coral' },
    ],
  },
  25: {
    kind: 'comparison', eyebrow: 'Timing lens', title: 'Before or after the action?',
    caption: 'Plain form before とき looks ahead; past form looks back after completion.',
    illustration: {
      src: '/images/grammar/n5/boards/n5_ch_twenty_five.webp',
      romaji: 'taberu toki · tabeta toki',
      meaning: 'before eating · after eating',
    },
    items: [
      { label: '食べる とき', note: 'before eating', tone: 'blue' },
      { label: '食べた とき', note: 'after eating', tone: 'coral' },
    ],
  },
}

function DiagramItem({ item }: { item: VisualItem }) {
  const tone = tones[item.tone]
  return (
    <div className={`min-w-0 rounded-xl border px-3 py-3 text-center shadow-sm ${tone.chip}`}>
      <p lang="ja" className="break-words text-lg font-bold leading-tight">{item.label}</p>
      <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] opacity-75">{item.note}</p>
    </div>
  )
}

function SequenceDiagram({ items }: { items: VisualItem[] }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-center">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <DiagramItem item={item} />
          {index < items.length - 1 && (
            <span aria-hidden="true" className="hidden shrink-0 text-lg text-home-accent sm:block">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

function RangeDiagram({ items }: { items: VisualItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((item, index) => {
        const tone = tones[item.tone]
        return (
          <div key={item.label} className={`relative overflow-hidden rounded-xl border px-4 py-4 ${tone.chip}`}>
            <span className={`absolute right-3 top-3 size-2 rounded-full ${tone.dot}`} />
            <span className="text-[0.66rem] font-bold uppercase tracking-[0.12em] opacity-60">Zone {index + 1}</span>
            <p lang="ja" className="mt-2 text-2xl font-bold leading-none">{item.label}</p>
            <p className="mt-2 text-xs font-semibold opacity-75">{item.note}</p>
          </div>
        )
      })}
    </div>
  )
}

function ComparisonDiagram({ items }: { items: VisualItem[] }) {
  return (
    <div className="grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <DiagramItem item={items[0]} />
      <div aria-hidden="true" className="hidden items-center justify-center text-xl font-bold text-home-accent sm:flex">↔</div>
      <DiagramItem item={items[1]} />
    </div>
  )
}

function ExchangeDiagram({ items }: { items: VisualItem[] }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <DiagramItem item={items[0]} />
      <span aria-hidden="true" className="hidden text-xl font-bold text-home-accent sm:block">→</span>
      <DiagramItem item={items[1]} />
      <span aria-hidden="true" className="hidden text-xl font-bold text-home-accent sm:block">→</span>
      <DiagramItem item={items[2]} />
    </div>
  )
}

function DirectionDiagram({ items }: { items: VisualItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <DiagramItem key={item.label} item={item} />
      ))}
    </div>
  )
}

function SpaceDiagram({ items }: { items: VisualItem[] }) {
  const [reference, top, bottom, side] = items
  return (
    <div className="grid grid-cols-3 items-center gap-2 text-center">
      <div />
      <DiagramItem item={top} />
      <div />
      <DiagramItem item={side} />
      <DiagramItem item={reference} />
      <div />
      <div />
      <DiagramItem item={bottom} />
      <div />
    </div>
  )
}

/** A concise visual primer shown before the lesson concepts where visual reasoning helps. */
export function ChapterVisual({ chapterId }: { chapterId: number }) {
  const spec = visuals[chapterId]
  if (!spec) return null

  if (spec.illustration) {
    const { illustration } = spec
    const alt = illustration.alt
      ?? `${spec.eyebrow} board: ${spec.items.map((item) => `${item.label} (${item.note})`).join(', ')}.`
    return (
      <figure className="mb-10 grid items-center gap-6 rounded-2xl border border-home-line bg-home-tile/60 px-5 py-4 sm:px-6 sm:py-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-10">
        {/* The art has ~10% empty transparent space under the board; the aspect crop trims it. */}
        <img
          src={asset(illustration.src)}
          alt={alt}
          width={1536}
          height={920}
          loading="lazy"
          decoding="async"
          className="mx-auto aspect-[1536/920] w-full max-w-[33rem] select-none object-cover object-top"
        />
        <figcaption className="min-w-0 md:self-end md:pb-3">
          <p className="text-2xs font-bold uppercase tracking-[0.16em] text-home-accent">{spec.eyebrow}</p>
          <h2 className="mt-1.5 font-headline text-xl font-bold leading-snug text-home-ink sm:text-2xl">{spec.title}</h2>

          <div className="mt-5 border-l-2 border-home-accent/60 pl-4">
            <p
              lang="ja"
              className={`flex flex-wrap gap-y-0.5 text-2xl font-bold leading-snug sm:text-[1.75rem] ${
                spec.kind === 'sequence' ? 'gap-x-1.5' : 'gap-x-5'
              }`}
            >
              {spec.items.map((item, index) => (
                // tone-ink is the high-contrast shade: lighter on navy, darker on white.
                <span key={`${item.label}-${index}`} className={`diagram-tone-${item.tone} whitespace-nowrap text-tone-ink`}>
                  {item.label}
                </span>
              ))}
            </p>
            <p className="mt-2 text-[0.9375rem] font-medium text-home-ink">{illustration.romaji}</p>
            <p className="text-[0.9375rem] italic text-home-muted">{illustration.meaning}</p>
          </div>

          <p className="mt-5 text-sm leading-6 text-home-muted">{spec.caption}</p>
        </figcaption>
      </figure>
    )
  }

  const diagram = spec.kind === 'range'
    ? <RangeDiagram items={spec.items} />
    : spec.kind === 'comparison'
    ? <ComparisonDiagram items={spec.items} />
    : spec.kind === 'direction'
    ? <DirectionDiagram items={spec.items} />
    : spec.kind === 'exchange'
    ? <ExchangeDiagram items={spec.items} />
    : spec.kind === 'space'
    ? <SpaceDiagram items={spec.items} />
    : <SequenceDiagram items={spec.items} />

  return (
    <figure className="mb-10 overflow-hidden rounded-2xl border border-home-line-strong bg-home-tile p-5 shadow-elevation-1 sm:p-6">
      <figcaption className="mb-5 flex flex-col gap-1 border-b border-home-line pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-home-accent">{spec.eyebrow}</p>
          <h2 className="mt-1 font-headline text-xl font-bold text-home-ink">{spec.title}</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-home-muted">{spec.caption}</p>
      </figcaption>
      {spec.scene && (
        <div className="mb-5 overflow-hidden rounded-xl border border-home-line-strong bg-home-tile sm:grid sm:grid-cols-[minmax(0,1.4fr)_minmax(13rem,0.6fr)]">
          <img
            src={asset(spec.scene.src)}
            alt={spec.scene.alt}
            className="aspect-[3/2] h-full w-full object-cover"
            loading="lazy"
          />
          <div className="flex flex-col justify-center bg-home-sage px-5 py-5 sm:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-home-accent">See it in context</p>
            <p className="mt-2 text-sm font-medium leading-6 text-home-ink">{spec.scene.caption}</p>
          </div>
        </div>
      )}
      {diagram}
    </figure>
  )
}
