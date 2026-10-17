import {
  GrammarChapter,
  GrammarConcept,
  GrammarExample,
  InteractiveSegment,
  JapaneseSegment,
  VocabItem,
} from '@/types/grammar';
import { IW_FALLBACK_ATTR, IW_PLACEHOLDER_ATTR } from '@/utils/richHtmlAttrs';
import {
  MATH_PATTERN,
  SUBSCRIPT_RE,
  chapterHeaderFromFrontmatter,
  mathToPlain,
  parseFrontmatter,
  stripTex,
} from '@/utils/mdxFrontmatter';

/* -------------------------------------------------------------------------- */
/*  Escaping                                                                  */
/* -------------------------------------------------------------------------- */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape a string for safe use as HTML text or a double-quoted attribute value. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/* -------------------------------------------------------------------------- */
/*  Interactive words                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Matches either
 *  1. an `<InteractiveWord … />` tag (any attribute order), or
 *  2. the legacy ruby form `漢字（かんじ）` — a kanji run immediately followed by a
 *     kana-only reading in full- or half-width parentheses. The base is limited
 *     to kanji so preceding kana/particles (e.g. `ジュースを飲（の）`) and
 *     kana alternatives (e.g. `じゃ（では）`) are not swallowed.
 */
const WORD_PATTERN =
  /<InteractiveWord\b([^>]*?)\/>|([一-鿿々]+)[（(]([぀-ゟ゠-ヿ]+)[)）]/g;

const ATTR_PATTERN = /(\w+)\s*=\s*"([^"]*)"/g;

function parseWordAttrs(attrText: string): InteractiveSegment | null {
  const attrs: Record<string, string> = {};
  for (const m of attrText.matchAll(ATTR_PATTERN)) attrs[m[1]] = m[2];
  if (!attrs.kanji) return null;
  return { kanji: attrs.kanji, reading: attrs.reading ?? '', meaning: attrs.meaning ?? '' };
}

function lookupMeaning(base: string, reading: string, vocab: VocabItem[]): string {
  const exact = vocab.find((v) => v.kanji === base);
  if (exact) return exact.meaning;
  const byReading = vocab.find((v) => v.reading === reading);
  if (byReading) return byReading.meaning;
  const partial = vocab.find((v) => v.kanji.length > 1 && (v.kanji.includes(base) || base.includes(v.kanji)));
  return partial ? partial.meaning : 'Vocabulary';
}

interface WordMatch {
  index: number;
  length: number;
  /** null when an `<InteractiveWord>` tag had no usable `kanji` attribute. */
  word: InteractiveSegment | null;
}

function findWords(text: string, vocab: VocabItem[]): WordMatch[] {
  const matches: WordMatch[] = [];
  for (const m of text.matchAll(WORD_PATTERN)) {
    const index = m.index ?? 0;
    if (m[2]) {
      matches.push({
        index,
        length: m[0].length,
        word: { kanji: m[2], reading: m[3], meaning: lookupMeaning(m[2], m[3], vocab) },
      });
    } else {
      matches.push({ index, length: m[0].length, word: parseWordAttrs(m[1] ?? '') });
    }
  }
  return matches;
}

/** HTML placeholder for one interactive word. Attribute values are escaped. */
function wordPlaceholder(word: InteractiveSegment): string {
  return (
    `<span ${IW_PLACEHOLDER_ATTR}="" data-kanji="${escapeHtml(word.kanji)}" ` +
    `data-reading="${escapeHtml(word.reading)}" data-meaning="${escapeHtml(word.meaning)}">` +
    `<span ${IW_FALLBACK_ATTR}="">${escapeHtml(word.kanji)}</span></span>`
  );
}

/* -------------------------------------------------------------------------- */
/*  Inline math ($N_1$, $\text{…}$)                                            */
/* -------------------------------------------------------------------------- */


/** `$N_1$ の $N_2$` → `N<sub>1</sub> の N<sub>2</sub>` (HTML). */
function mathToHtml(text: string): string {
  return text.replace(MATH_PATTERN, (_, expr: string) => {
    const html = escapeHtml(stripTex(expr)).replace(
      SUBSCRIPT_RE,
      (_m, base: string, braced?: string, bare?: string) => `${base}<sub>${braced ?? bare}</sub>`,
    );
    return `<span class="italic">${html}</span>`;
  });
}

/* -------------------------------------------------------------------------- */
/*  Inline markdown                                                           */
/* -------------------------------------------------------------------------- */

const TOKEN_RE = /\u0000(\d+)\u0000/g;

/**
 * Inline markdown → HTML. Interactive words become `RichHtml` placeholders and
 * `$…$` math becomes subscripted HTML. Both are swapped out for opaque tokens
 * first so the markdown regexes can never touch their (escaped) attribute values.
 */
export function parseInlineMarkdown(text: string, vocab: VocabItem[] = []): string {
  const stash: string[] = [];
  const token = (html: string) => `\u0000${stash.push(html) - 1}\u0000`;

  let out = '';
  let last = 0;
  for (const m of findWords(text, vocab)) {
    out += text.slice(last, m.index);
    out += m.word ? token(wordPlaceholder(m.word)) : '';
    last = m.index + m.length;
  }
  out += text.slice(last);

  out = out
    .replace(MATH_PATTERN, (expr) => token(mathToHtml(expr)))
    // Raw JSX-style attributes authored in the MDX must be real HTML attributes.
    .replace(/(<[a-z][^>]*?)\sclassName=/g, '$1 class=')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-surface-container-high px-1 rounded text-primary text-sm">$1</code>');

  return out.replace(TOKEN_RE, (_, i: string) => stash[Number(i)]);
}

const BULLET_RE = /^(?:\*|\d+\.)\s+/;

export function parseMarkdownBlock(lines: string[], vocab: VocabItem[] = []): string {
  let html = '';
  let inTable = false;
  const inline = (s: string) => parseInlineMarkdown(s, vocab);

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) {
      if (inTable) { html += '</tbody></table></div>'; inTable = false; }
      html += '<br/><br/>';
      continue;
    }

    // Skip horizontal rules
    if (t === '---' || t === '***' || t === '___') {
      if (inTable) { html += '</tbody></table></div>'; inTable = false; }
      continue;
    }

    if (t.startsWith('![')) {
      const imgMatch = t.match(/^!\[([^\]]*)]\(([^)]+)\)/);
      if (imgMatch) {
        const alt = escapeHtml(imgMatch[1]);
        const src = escapeHtml(imgMatch[2]);
        html += `<div class="my-3"><img src="${src}" alt="${alt}" class="w-full h-auto object-contain max-h-[420px]" loading="lazy" /></div>`;
      }
      continue;
    }

    if (t.startsWith('|') && t.endsWith('|')) {
      if (!inTable) {
        html += '<div class="overflow-x-auto my-6"><table class="w-full text-left border-collapse border border-outline-variant/30 rounded-lg shadow-sm bg-surface-container-low text-sm"><tbody class="divide-y divide-outline-variant/20">';
        inTable = true;
      }
      if (t.includes(':---')) continue; // Skip header separator

      const cells = t.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      html += '<tr class="hover:bg-primary/5 transition-colors">';
      const isHeader = lines[i+1] && lines[i+1].includes(':---');
      cells.forEach(c => {
        const tag = isHeader ? 'th' : 'td';
        const classes = isHeader
          ? 'py-2 px-3 font-bold text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant bg-surface-container-highest/30 leading-tight'
          : 'py-2 px-3 text-on-surface text-xs sm:text-sm font-medium border-r border-outline-variant/10 last:border-0 leading-snug';
        html += `<${tag} class="${classes}">${inline(c)}</${tag}>`;
      });
      html += '</tr>';
      continue;
    } else if (inTable) {
      html += '</tbody></table></div>';
      inTable = false;
    }

    if (t.startsWith('>')) {
      // Group consecutive quote lines into one callout and render its body as a block
      // (so `> * item` lines become bullets inside the callout).
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      i--;
      html += `<div class="border-l-4 border-primary/40 pl-4 py-1 my-2 bg-primary/5 rounded-r">${parseMarkdownBlock(quoteLines, vocab)}</div>`;
    } else if (t.startsWith('### ')) {
      html += `<h5 class="text-primary font-bold mt-3 mb-1.5 text-[15px]">${inline(t.replace(/^###\s+/, ''))}</h5>`;
    } else if (BULLET_RE.test(t)) {
      const indent = lines[i].match(/^\s*/)?.[0].length ?? 0;
      const margin = indent >= 2 ? 'ml-8' : 'ml-4';
      const ordinal = t.match(/^(\d+)\./)?.[1];
      const marker = ordinal ? `${ordinal}.` : '•';
      html += `<div class="${margin} flex gap-2 mt-1"><span class="text-primary">${marker}</span> <span>${inline(t.replace(BULLET_RE, ''))}</span></div>`;
    } else {
      if (html.endsWith('<br/><br/>') || html === '' || html.endsWith('</div>')) {
        html += inline(t);
      } else {
        html += '<br/>' + inline(t);
      }
    }
  }

  if (inTable) { html += '</tbody></table></div>'; }
  return html.replace(/(<br\/>){3,}/g, '<br/><br/>');
}

/**
 * Split a Japanese example sentence into plain-HTML strings and interactive words.
 * String segments are rendered as HTML by the caller; math in them is converted.
 */
export function parseSegments(line: string, chapterVocab: VocabItem[] = []): JapaneseSegment[] {
  const segments: JapaneseSegment[] = [];
  const pushText = (s: string) => { if (s) segments.push(mathToHtml(s)); };

  let lastIndex = 0;
  for (const m of findWords(line, chapterVocab)) {
    pushText(line.slice(lastIndex, m.index));
    if (m.word) segments.push(m.word);
    lastIndex = m.index + m.length;
  }
  pushText(line.slice(lastIndex));
  return segments;
}

/** A blockquote label (`> **Key Rule:** …`) routed to a dedicated concept slot. */
function quoteSlot(label: string): 'keyRule' | 'note' | null {
  if (/^Key Rule\b/.test(label)) return 'keyRule';
  if (/^(Pro Tip|Warning)\b/.test(label)) return 'note';
  return null;
}

/** Inline HTML for a continuation line of a key-rule / note callout (rendered inside a `<p>`). */
function quoteContinuation(text: string, vocab: VocabItem[]): string {
  if (BULLET_RE.test(text)) {
    return `<br/><span class="inline-flex gap-2 ml-2"><span class="text-primary not-italic">•</span><span>${parseInlineMarkdown(text.replace(BULLET_RE, ''), vocab)}</span></span>`;
  }
  return ' ' + parseInlineMarkdown(text, vocab);
}

export function parseMdxToChapter(rawMdx: string): GrammarChapter {
  // Some files escape the quotes inside <InteractiveWord kanji=\"…\" />; normalise them.
  const mdx = rawMdx.replace(/<InteractiveWord\b[^>]*\/>/g, (tag) => tag.replace(/\\"/g, '"'));
  const chapter: GrammarChapter = {
    ...chapterHeaderFromFrontmatter(parseFrontmatter(mdx)),
    concepts: [],
    sidebar: { vocab: [] }
  };

  const bodyEnd = mdx.indexOf('---', 3);
  const bodyText = bodyEnd !== -1 ? mdx.slice(bodyEnd + 3) : mdx;
  const sections = bodyText.split('\n## ');
  const vocab = chapter.sidebar.vocab;

  // PASS 1: Parse Vocabulary First
  for (const sec of sections) {
    const sectionText = sec.trim();
    if (sectionText.startsWith('Chapter')) {
      const rows = sectionText.match(/\|\s*<InteractiveWord[^\n]+/g) || [];
      for (const row of rows) {
        const cells = row.split('|').filter((c: string) => c.trim().length > 0);
        if (cells.length >= 1) {
          const tag = cells[0].match(/<InteractiveWord\b([^>]*?)\/>/);
          const word = tag ? parseWordAttrs(tag[1]) : null;
          if (word) vocab.push({ ...word, romaji: '' });
        }
      }
    }
  }

  // PASS 2: Parse Concepts and Rules
  for (const sec of sections) {
    const sectionText = sec.trim();
    if (sectionText.startsWith('Concept')) {
      const firstLineBreak = sectionText.indexOf('\n');
      const header = sectionText.slice(0, firstLineBreak);
      const content = sectionText.slice(firstLineBreak + 1);

      const conceptMatch = header.match(/Concept (\d+): (.*)/);
      if (!conceptMatch) continue;

      const concept: GrammarConcept = {
        id: conceptMatch[1],
        title: mathToPlain(conceptMatch[2]),
        description: '',
        examples: []
      };

      const parts = content.split('### Example Sentences');
      const descAndNotes = parts[0];
      const examplesText = parts[1] || '';

      const lines = descAndNotes.split('\n');
      const descLines: string[] = [];
      // Which callout slot the current run of `>` lines belongs to.
      let quoteTarget: 'keyRule' | 'note' | 'desc' | null = null;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { quoteTarget = null; continue; }

        if (!trimmed.startsWith('>')) {
          quoteTarget = null;
          descLines.push(line);
          continue;
        }

        const body = trimmed.replace(/^>\s?/, '');
        const labelled = body.match(/^\*\*(.*?)\*\*\s*(.*)/);
        const slot = labelled ? quoteSlot(labelled[1]) : null;

        if (labelled && slot && !concept[slot]) {
          // `> **Key Rule:** …` / `> **Pro Tip:** …` → dedicated slot (label dropped, UI renders its own).
          concept[slot] = parseInlineMarkdown(labelled[2].trim(), vocab);
          quoteTarget = slot;
        } else if (!labelled && (quoteTarget === 'keyRule' || quoteTarget === 'note')) {
          concept[quoteTarget] += quoteContinuation(body.trim(), vocab);
        } else {
          // Any other callout (`> **Pattern:** …`, `> **Exception:** …`, a 2nd key rule)
          // stays in the description, rendered as a quote block with its label.
          quoteTarget = 'desc';
          descLines.push(line);
        }
      }
      concept.description = parseMarkdownBlock(descLines, vocab);

      if (examplesText) {
        const exLines = examplesText.split('\n');
        let currentExample: GrammarExample | null = null;

        for (let i = 0; i < exLines.length; i++) {
          const line = exLines[i];
          const jpMatch = line.match(/^\s*\*\s+\*\*(.*?)\*\*(.*)/);
          if (jpMatch) {
            if (currentExample) concept.examples.push(currentExample);

            const englishInline = jpMatch[2].replace(/[()]/g, '').trim();
            currentExample = {
              japanese: parseSegments(jpMatch[1].trim(), vocab),
              english: mathToPlain(englishInline)
            };
          } else if (currentExample && line.trim().startsWith('*')) {
            let text = line.trim().replace(/^\*\s*/, '').trim();
            text = mathToPlain(text.replace(/^\*|\*$/g, '').trim());

            if (!currentExample.english) {
              currentExample.english = text;
            } else {
              currentExample.romaji = currentExample.english;
              currentExample.english = text;
            }
          }
        }
        if (currentExample) concept.examples.push(currentExample);
      }

      chapter.concepts.push(concept);
    }
    else if (sectionText.startsWith('Sidebar:')) {
      // Extract the subtitle after "Sidebar: " for the card title
      const sidebarTitle = mathToPlain(sectionText.split('\n')[0].replace(/^Sidebar:\s*/, '').trim()) || 'Notes & Insights';
      // Render ALL content lines (### headings, bullets, etc.) through parseMarkdownBlock
      const contentLines = sectionText.split('\n').slice(1); // skip the "Sidebar: ..." heading line
      chapter.sidebar.culturalInsight = {
        title: sidebarTitle,
        content: parseMarkdownBlock(contentLines, vocab)
      };
    }
  }

  return chapter;
}
