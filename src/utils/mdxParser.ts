import { GrammarChapter, GrammarConcept, GrammarExample, JapaneseSegment } from '@/types/grammar';

export function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-surface-container-high px-1 rounded text-primary text-sm">$1</code>');
}

export function parseMarkdownBlock(lines: string[]): string {
  let html = '';
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) {
      if (inTable) { html += '</tbody></table></div>'; inTable = false; }
      html += '<br/><br/>';
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
          ? 'py-3 px-4 font-bold text-xs uppercase tracking-widest text-on-surface-variant bg-surface-container-highest/30' 
          : 'py-3 px-4 text-on-surface font-medium border-r border-outline-variant/10 last:border-0';
        html += `<${tag} class="${classes}">${parseInlineMarkdown(c)}</${tag}>`;
      });
      html += '</tr>';
      continue;
    } else if (inTable) {
      html += '</tbody></table></div>';
      inTable = false;
    }

    if (t.startsWith('### ')) {
      html += `<h5 class="text-primary font-bold mt-6 mb-2 text-[15px]">${parseInlineMarkdown(t.replace(/^###\s+/, ''))}</h5>`;
    } else if (t.startsWith('* ')) {
      html += `<div class="ml-4 flex gap-2 mt-1"><span class="text-primary">•</span> <span>${parseInlineMarkdown(t.replace(/^\*\s+/, ''))}</span></div>`;
    } else if (t.startsWith('> ') || t.startsWith('>')) {
      // Handled elsewhere for notes/key rules, but if it leaks:
      html += `<div class="border-l-4 border-primary/40 pl-4 py-1 italic my-2 bg-primary/5 rounded-r">${parseInlineMarkdown(t.replace(/^>\s*/, ''))}</div>`;
    } else {
      if (html.endsWith('<br/><br/>') || html === '' || html.endsWith('</div>')) {
        html += parseInlineMarkdown(t);
      } else {
        html += '<br/>' + parseInlineMarkdown(t);
      }
    }
  }

  if (inTable) { html += '</tbody></table></div>'; }
  return html.replace(/(<br\/>){3,}/g, '<br/><br/>');
}

export function parseFrontmatter(text: string) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const block = match[1];
  const fm: Record<string, string> = {};
  block.split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon > -1) {
      const key = line.slice(0, colon).trim();
      const val = line.slice(colon + 1).trim().replace(/^"|"$/g, '');
      fm[key] = val;
    }
  });
  return fm;
}

export function parseSegments(line: string): JapaneseSegment[] {
  const segments: JapaneseSegment[] = [];
  const regex = /<InteractiveWord\s+kanji="([^"]+)"\s+reading="([^"]+)"\s+meaning="([^"]+)"\s*\/>/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push(line.slice(lastIndex, match.index));
    }
    segments.push({
      kanji: match[1],
      reading: match[2],
      meaning: match[3]
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    segments.push(line.slice(lastIndex));
  }
  return segments;
}

export function parseMdxToChapter(mdx: string): GrammarChapter {
  const fm = parseFrontmatter(mdx) as any;
  const chapter: GrammarChapter = {
    id: parseInt(fm.chapter) || 1,
    level: (fm.level || 'n5').toLowerCase(),
    title: fm.title || 'Untitled Phase',
    description: fm.description || '',
    concepts: [],
    sidebar: { vocab: [] }
  };

  const bodyEnd = mdx.indexOf('---', 3);
  const bodyText = bodyEnd !== -1 ? mdx.slice(bodyEnd + 3) : mdx;

  const sections = bodyText.split('\n## ');
  
  for (const sec of sections) {
    const sectionText = sec.trim();
    if (sectionText.startsWith('Concept')) {
      const firstLineBreak = sectionText.indexOf('\n');
      const header = sectionText.slice(0, firstLineBreak);
      const content = sectionText.slice(firstLineBreak + 1);
      
      const conceptMatch = header.match(/Concept \d+: (.*)/);
      if (!conceptMatch) continue;
      
      const concept: GrammarConcept = {
        id: conceptMatch[1],
        title: conceptMatch[2],
        description: '',
        examples: []
      };

      const parts = content.split('### Example Sentences');
      const descAndNotes = parts[0];
      const examplesText = parts[1] || '';
      
      const lines = descAndNotes.split('\n');
      const descLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith('> **Key Rule:**') || trimmed.startsWith('> **Key Rule') || trimmed.startsWith('> **Pro Tip:**') || trimmed.startsWith('> **Warning:**')) {
          const words = trimmed.match(/> \*\*(.*?)\*\*\s*(.*)/);
          if (words) {
             const key = words[1];
             const text = words[2];
             if (key.includes('Rule')) concept.keyRule = parseInlineMarkdown(text.trim());
             else concept.note = parseInlineMarkdown(text.trim());
          }
        } 
        else if (trimmed.startsWith('>')) { // Continuation
           if (concept.note) concept.note += ' ' + parseInlineMarkdown(trimmed.replace(/^>\s*/, ''));
           else if (concept.keyRule) concept.keyRule += ' ' + parseInlineMarkdown(trimmed.replace(/^>\s*/, ''));
        }
        else {
          descLines.push(trimmed);
        }
      }
      concept.description = parseMarkdownBlock(descLines);
      
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
                  japanese: parseSegments(jpMatch[1].trim()),
                  english: englishInline
               };
            } else if (currentExample && line.trim().startsWith('*')) {
                let text = line.trim().replace(/^\*\s*/, '').trim();
                text = text.replace(/^\*|\*$/g, '').trim();
                
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
      const rest = sectionText.split('\n');
      const titleMatch = sectionText.match(/### (.*)/);
      if (titleMatch) {
         const titleLineIdx = rest.findIndex(l => l.startsWith('###'));
         chapter.sidebar.culturalInsight = {
            title: titleMatch[1].replace(/[🚩🎓]/g, '').trim(),
            content: parseMarkdownBlock(rest.slice(titleLineIdx + 1))
         };
      }
    }
    else if (sectionText.startsWith('Chapter')) {
      const rows = sectionText.match(/\|\s*<InteractiveWord[^\n]+/g) || [];
      for (const row of rows) {
         const cells = row.split('|').filter((c: string) => c.trim().length > 0);
         if (cells.length >= 1) {
             const wordCell = cells[0];
             const compMatch = wordCell.match(/kanji="([^"]+)"\s+reading="([^"]+)"\s+meaning="([^"]+)"/);
             if (compMatch) {
                chapter.sidebar.vocab.push({
                   kanji: compMatch[1],
                   reading: compMatch[2],
                   meaning: compMatch[3],
                   romaji: ''
                });
             }
         }
      }
    }
  }

  return chapter;
}
