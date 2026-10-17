# Kana stroke data

`hiragana.json` holds stroke-order data for the basic and dakuten hiragana plus
small ゃ ゅ ょ (74 characters, 215 strokes):

```json
{ "あ": { "strokes": ["M31.01,33c…", "…"], "numbers": [[22.51, 35], …] } }
```

- `strokes`: SVG path data for each stroke, in writing order, in KanjiVG's
  109×109 coordinate box.
- `numbers`: where KanjiVG places each stroke-number label (same order).

Compounds such as きゃ are composed at runtime from the base kana and the small
kana (see `src/components/kana/useKanaStrokes.ts`).

## Katakana

`katakana.json` uses the same schema and holds the basic and dakuten katakana,
ヴ, small ァ ィ ゥ ェ ォ ャ ュ ョ ッ and the long-vowel mark ー (82 characters,
240 strokes). Yōon (キャ) and foreign-sound combinations (ファ, ティ, ヴァ, …) are
composed at runtime from a base kana plus a small kana, exactly like hiragana
compounds. Small ッ and ー are single glyphs taught on their own.

## Source and licence

- Source: [KanjiVG](https://kanjivg.tagaini.net) by Ulrich Apel and contributors,
  <https://github.com/KanjiVG/kanjivg> (files `kanji/<codepoint>.svg`, master branch).
- Licence: [Creative Commons Attribution-Share Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

`hiragana.json` and `katakana.json` are derived works of KanjiVG (only the stroke paths and number
positions were extracted and reformatted) and are distributed under the same
CC BY-SA 3.0 licence. Keep this attribution, and the credit line shown in the
kana sheet's stroke section, wherever this data is used.
