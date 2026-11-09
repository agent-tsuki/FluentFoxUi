export interface InteractiveSegment {
  kanji: string;
  reading: string;
  meaning: string;
}

export type JapaneseSegment = string | InteractiveSegment;

export interface GrammarExample {
  japanese: JapaneseSegment[];
  romaji?: string;
  english: string;
}

export interface GrammarConcept {
  id: string;
  title: string;
  description: string;
  descriptionSegments?: JapaneseSegment[];
  keyRule?: string;
  examples: GrammarExample[];
  note?: string;
}

export interface VocabItem {
  kanji: string;
  reading: string;
  romaji?: string;
  meaning: string;
}

export interface GrammarChapter {
  id: number;
  level: string;
  title: string;
  description: string;
  concepts: GrammarConcept[];
  sidebar: {
    vocab: VocabItem[];
    culturalInsight?: {
      title: string;
      content: string;
    };
  };
}

/** A chapter as listed in navigation: available without loading its body. */
export type GrammarChapterSummary = Pick<GrammarChapter, 'id' | 'level' | 'title'>;

/** GET /content/grammar/{level}/chapters/{slug}: a chapter's words and its sentences read in full. */
export interface ChapterContent {
  slug: string
  number: number
  title: string
  words: ChapterWordContent[]
  sentences: ChapterSentenceText[]
  /** The Listening tab's dialogues and passages; missing from an API older than the listening content. */
  passages?: ChapterPassage[]
}

/**
 * A short dialogue (two speakers, two voices) or passage (one voice). Text is
 * written with readings: "私[わたし] は 学生[がくせい] です。" (see
 * lib/content/listening/rubyText).
 */
export interface ChapterPassage {
  kind: 'dialogue' | 'monologue'
  title: string
  /** A dialogue's 2–4 speakers, or a monologue's reader (if named), written with readings. */
  speakers: string[]
  /** Each speaker's voice: a cast key for `/audio/speech` (e.g. "f1"); missing from older APIs. */
  speaker_voices?: string[]
  lines: ChapterPassageLine[]
}

export interface ChapterPassageLine {
  /** Which speaker of a dialogue (index into `speakers`); missing in a monologue. */
  speaker?: number
  text: string
  translation: string
  /** What to speak instead of the text, where the voice engine misreads it as written. */
  say?: string
}

export interface ChapterWordContent {
  word: string
  kana: string
  romaji: string
  meaning: string
  hint?: string
  /** What to speak instead of the kana, where the voice engine misreads the kana alone. */
  say?: string
}

export interface ChapterSentenceText {
  text: string
  translation: string
}
