/**
 * One-line memory hints for the 46 basic hiragana, keyed by romaji.
 * Written for FoxSensei (original wording). Keep each hint short: a picture
 * that ties the shape to the sound. Edit freely.
 */
export const KANA_MNEMONICS: Record<string, string> = {
  a:   'A cross with a loop swinging under it: “ah!”, you tripped over the cross.',
  i:   'Two little reeds leaning together, like two “i”s standing side by side.',
  u:   'A dash over a big curve: a UFO hovering over its tractor beam.',
  e:   'A dancer with a hat, flicking out one leg: “eh, look at me!”',
  o:   'A cross with a looping tail and a dot: an old man with his cane and a hat on the hook.',
  ka:  'A blade with a spark beside it: the “ka!” of steel striking stone.',
  ki:  'Two bars on a post with a curl at the foot: a kite string tied round a pole.',
  ku:  'One sharp corner, like a crooked elbow: “ku”-rled up tight.',
  ke:  'A post and a tall crossed stalk: a kettle with its handle and spout.',
  ko:  'Two short strokes, one above the other: a couple of chopsticks at rest.',
  sa:  'A bar, a slash, and a hooked chin below: someone sighing “saaa”.',
  shi: 'One long hook: a fishing line, “shh”, the fish are listening.',
  su:  'A bar with a loop dropped through it: a sushi roll being tied with string.',
  se:  'A bar with two posts, one bent like a chair: “se”-t yourself down.',
  so:  'A zig-zag that sweeps down: a sound wave zipping along, “so-o-o”.',
  ta:  'A cross with two small strokes beside it: a table set with two plates.',
  chi: 'A bar and a belly bulging right: a chief with a very full tummy.',
  tsu: 'A sideways cup: sip your tea, “tsu-tsu”.',
  te:  'A bar with one arm hanging down: a telescope on its mount.',
  to:  'A short tick resting on a curve: the brim of a top hat.',
  na:  'A cross, a dot, and a knot below: a nail with string tied round it.',
  ni:  'A post next to two little steps: nimbly hop up the stairs.',
  nu:  'Like め but with a curl at the end: a new tail has grown.',
  ne:  'A post with a thread curling into a knot: a necklace clasp.',
  no:  'One spiral: a snail shell, “no” rush.',
  ha:  'A door post beside a bow-tied loop: a hat hanging by the door.',
  hi:  'One wide sagging line: a hammock, heave (“hi”) yourself in.',
  fu:  'A dot, a curl and two flicks: a little bird flapping, “fu-fu”, to cool off.',
  he:  'A simple roof peak pointing up: “heh?”, which way is up?',
  ho:  'Like は with an extra bar: a home with a chimney on the post.',
  ma:  'A post with two bars and a loop at the foot: a mast with its sail tied on.',
  mi:  'A knot with a long tail and a small tick: a ribbon tied midway.',
  mu:  'A loop with a tail and a dot flying off: a music note tumbling off the page.',
  me:  'Crossed sticks wrapped with a loop: a messy bundle of firewood.',
  mo:  'A hook with two bars across it: a mop hanging up to dry.',
  ya:  'A slingshot with its band pulled back: “ya!”, fire!',
  yu:  'A curling path crossed by one tall post: a U-turn sign.',
  yo:  'A cross with a loop tied at the base: a sailor’s knot, “yo-ho!”',
  ra:  'A tick over a curled seat: a rattle with a little handle.',
  ri:  'Two strokes, the right one longer: a ribbon hanging from a pin.',
  ru:  'Like ろ but finishing in a loop: a ruby tied on the end.',
  re:  'A post with an arm that kicks out: stretching to reach (“re”-ach).',
  ro:  'Like る without the loop: a rope with its knot undone.',
  wa:  'Like ね without the knot: the tail swings wide, “wa-ah!”',
  wo:  'A spinning top tilting on its point: it wobbles (“wo”).',
  n:   'One quick swoop with a dip, like a lower-case n written in a hurry.',
}

/** Romaji for each basic hiragana, so voiced/compound kana can name their base. */
const BASIC_ROMAJI: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'wo', ん: 'n',
}

const DAKUTEN = '゙'
const HANDAKUTEN = '゚'
const SMALL_Y: Record<string, string> = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' }

function voicedHint(character: string, romaji: string): string | undefined {
  // NFD splits が into か + combining dakuten, ぱ into は + handakuten.
  const [base, mark] = Array.from(character.normalize('NFD'))
  const baseRomaji = BASIC_ROMAJI[base]
  if (!baseRomaji) return undefined
  if (mark === HANDAKUTEN) {
    return `${character} is ${base} with a small circle: the sound pops into a “p”: ${baseRomaji} → ${romaji}.`
  }
  if (mark !== DAKUTEN) return undefined
  const rare = character === 'ぢ' || character === 'づ'
    ? ` It sounds like ${character === 'ぢ' ? 'じ (ji)' : 'ず (zu)'} and is rarely used.`
    : ''
  return `${character} is ${base} with two dots: the sound turns voiced: ${baseRomaji} → ${romaji}.${rare}`
}

/**
 * The memory hint for any chart kana: its own mnemonic for the basic 46, and
 * a short explanation of the dakuten mark or the small ゃゅょ otherwise.
 */
export function kanaMemoryHint(character: string, romaji: string): string | undefined {
  const chars = Array.from(character)
  if (chars.length === 2 && SMALL_Y[chars[1]]) {
    const [head, small] = chars
    const headRomaji = BASIC_ROMAJI[head] ?? voicedRomaji(head)
    return `${head} plus a small ${small}: the small ${small} isn't its own beat, it glides into ${head}: ${headRomaji ?? head} + ${SMALL_Y[small]} → ${romaji}.`
  }
  return KANA_MNEMONICS[romaji] ?? voicedHint(character, romaji)
}

const VOICED: Record<string, string> = { k: 'g', s: 'z', t: 'd', h: 'b' }

/** Romaji of a dakuten/handakuten kana built from its base (ぎ → gi, ぴ → pi). */
function voicedRomaji(character: string): string | undefined {
  const [base, mark] = Array.from(character.normalize('NFD'))
  const r = BASIC_ROMAJI[base]
  if (!r || !mark) return undefined
  if (mark === HANDAKUTEN) return 'p' + r.slice(1)
  if (r === 'shi') return 'ji'
  if (r === 'chi') return 'ji'
  if (r === 'tsu') return 'zu'
  if (r === 'fu') return 'bu'
  const voiced = VOICED[r[0]]
  return voiced ? voiced + r.slice(1) : undefined
}
