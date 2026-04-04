# Grammar MDX Authoring Guide

This guide explains the exact format required when creating new `.mdx` files (like `chapter-4.mdx`) in `src/assets/grammar/n5/`. Follow this structure to ensure the custom `mdxParser` renders your files perfectly into the beautiful Bento UI.

---

## 1. Frontmatter (Required)
Every file must start with YAML frontmatter. This dictates the core routing and hero text.

```yaml
---
chapter: 4
title: "Your Chapter Title"
level: "N5"
description: "A short 1-2 sentence description for the hero section."
---
```

## 2. Concepts (Required)
Each grammar point is wrapped in a Concept block. 
You **must** start it with `## Concept XX: Title`. Everything between this header and the next `##` header belongs to this concept.

```md
## Concept 01: Noun Sentences
This is the description. It supports **bold**, *italics*, and paragraphs.

### Example Sentences

* **<InteractiveWord kanji="学生" reading="がくせい" meaning="Student" /> です。**
    * *Gakusei desu.*
    * I am a student.
```

### Critical Rules for Concepts:
1. **Key Rules & Notes:** You can inject styled boxes by starting a blockquote with specific words:
   - `> **Key Rule:** Your rule here.`
   - `> **Note:** Your note here.`
   - `> **Pro Tip:** Your tip here.`
   - `> **Warning:** Your warning here.`
2. **`### Example Sentences` IS MANDATORY!** You must place this exact header before listing examples. Otherwise, your examples will be lumped into the description.
3. **Example Syntax:**
   - Must be an unordered list (`* `).
   - Line 1: Japanese text in `**bold**`. Include `<InteractiveWord>` here.
   - Line 2 (Optional): Romaji in `*italics*`.
   - Line 3: English Translation.

## 3. Sidebar (Optional, Must be Unique)
To create the cultural insights sidebar, create a `## Sidebar:` section. All `###` subheaders here will be rendered beautifully as styled cards.

```md
## Sidebar: Cultural Insights

### The "Anata" Trap
In English, "you" is neutral. In Japanese, it's rude.
* Always use names!
* Bullet points work great here.

### Another Tip
You can have multiple subheadings inside the sidebar.
```

## 4. Vocabulary (Optional)
To generate the interactive vocab grid, use a section starting with `## Chapter`. 
It must contain a markdown table with exactly `<InteractiveWord>` as the first column.

```md
## Chapter 4 Vocabulary Grid

| Word | Context |
| :--- | :--- |
| <InteractiveWord kanji="家" reading="いえ" meaning="House" /> | Place of living |
| <InteractiveWord kanji="猫" reading="ねこ" meaning="Cat" /> | Meow |
```

---
**Tip:** The easiest way to create a new chapter is to simply copy-paste `chapter-1.mdx` or `chapter-2.mdx` and replace the content!
