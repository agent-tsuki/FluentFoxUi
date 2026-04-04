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
