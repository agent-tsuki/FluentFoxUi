/**
 * Confusable katakana for the look-alike drill. `ids` are chart ids (the same
 * ids as hiragana); `chars` are the katakana in the same order, for display.
 * Each `tip` is one line telling the shapes apart. Edit freely.
 */
export interface KatakanaLookAlike {
  ids: string[]
  chars: string[]
  tip: string
}

export const KATAKANA_LOOK_ALIKES: KatakanaLookAlike[] = [
  { ids: ['shi', 'tsu'], chars: ['シ', 'ツ'], tip: 'シ: dots on the left, the long stroke sweeps UP. ツ: dots on top, the long stroke falls DOWN.' },
  { ids: ['so', 'n'], chars: ['ソ', 'ン'], tip: 'ソ: the long stroke falls from the top. ン: the dot sits on the left and the long stroke rises from the bottom.' },
  { ids: ['shi', 'tsu', 'so', 'n'], chars: ['シ', 'ツ', 'ソ', 'ン'], tip: 'Rising strokes (シ ン) are written bottom-up; falling ones (ツ ソ) top-down.' },
  { ids: ['ku', 'ke', 'ta'], chars: ['ク', 'ケ', 'タ'], tip: 'ク: one hooked roof. タ: ク plus a dash inside. ケ: a straight bar with a separate leg dropping from it.' },
  { ids: ['u', 'wa', 'fu', 'wo'], chars: ['ウ', 'ワ', 'フ', 'ヲ'], tip: 'フ is the bare hook; ワ adds a left post; ウ adds a post and a dot on top; ヲ adds a bar through the middle.' },
  { ids: ['fu', 'ra'], chars: ['フ', 'ラ'], tip: 'ラ is フ with a short separate bar floating above it.' },
  { ids: ['no', 'me'], chars: ['ノ', 'メ'], tip: 'ノ is a single falling stroke; メ crosses it with a second short stroke.' },
  { ids: ['na', 'me'], chars: ['ナ', 'メ'], tip: 'ナ has a flat horizontal bar; メ has no horizontal, only two crossing slants.' },
  { ids: ['chi', 'te'], chars: ['チ', 'テ'], tip: 'チ starts with a slanted slash and the post pierces the bar; テ has two flat bars and the stroke hangs below.' },
  { ids: ['a', 'ma'], chars: ['ア', 'マ'], tip: 'ア: the tail is long and falls away to the lower left. マ: the tail is a short tick that turns back in.' },
  { ids: ['ko', 'yu'], chars: ['コ', 'ユ'], tip: 'コ opens to the left with equal bars; ユ’s bottom bar runs past the side, like a stand.' },
  { ids: ['e', 'yu'], chars: ['エ', 'ユ'], tip: 'エ’s post stands in the middle; ユ’s post is on the right and the box opens left.' },
  { ids: ['ro', 'ko'], chars: ['ロ', 'コ'], tip: 'ロ is a closed box (three strokes); コ is open on the left (two strokes).' },
  { ids: ['nu', 'su'], chars: ['ヌ', 'ス'], tip: 'ヌ: a slash cuts across the hook. ス: the second stroke only kicks out to the lower right.' },
  { ids: ['ha', 'ru'], chars: ['ハ', 'ル'], tip: 'ハ: two separate strokes spreading apart. ル: the right stroke bends and flicks up at the end.' },
]

/**
 * Katakana that look like their hiragana twin (same id in both charts), for a
 * cross-script look-alike drill: show the katakana and its hiragana side by side.
 */
export interface KanaTwin {
  id: string
  katakana: string
  hiragana: string
  tip: string
}

export const KATAKANA_HIRAGANA_TWINS: KanaTwin[] = [
  { id: 'ka', katakana: 'カ', hiragana: 'か', tip: 'Same shape; katakana カ just drops the little spark stroke.' },
  { id: 'he', katakana: 'ヘ', hiragana: 'へ', tip: 'Practically identical; katakana ヘ is a touch sharper and more angular.' },
  { id: 'ri', katakana: 'リ', hiragana: 'り', tip: 'Both are two strokes; katakana リ is straight, hiragana り curves and is often joined.' },
  { id: 'mo', katakana: 'モ', hiragana: 'も', tip: 'Katakana モ is straight and its post only curls; hiragana も’s stroke hooks right up.' },
  { id: 'se', katakana: 'セ', hiragana: 'せ', tip: 'Katakana セ has one hooked arm; hiragana せ has two posts crossing the bar.' },
  { id: 'ki', katakana: 'キ', hiragana: 'き', tip: 'Katakana キ is three straight strokes; hiragana き adds a curl at the foot.' },
  { id: 'ya', katakana: 'ヤ', hiragana: 'や', tip: 'Katakana ヤ is two strokes; hiragana や adds a small dot.' },
]
