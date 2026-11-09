# Agent 6: User-Information Evaluator

## What the user told us
- Verbatim: "Extract the design system from this codebase and make a new design system. https://www.foxsensei.com/grammar/n5/2 this page look too much simple and complex I want user to say navigate and use this website."
- Read as: (1) document the existing design system (tokens, primitives); (2) propose a new or improved one; (3) the grammar chapter page is the trigger example. It feels both "too simple" (flat, samey, no hierarchy or journey) and "too complex" (repeated chrome, boxes inside boxes, unclear next step); (4) the goal is **easy navigation and use** ("say" = "easily").
- They asked for a team: design review, cross-questioning, intent gathering, UI/UX review, a manager, and an evaluator that asks questions when needed.
- Not stated: scope beyond this page, the target user, the visual direction, whether to change code or only produce designs, the nav or URL constraints, or any business model.

## Answered from evidence (no need to ask)
| Question (03 §8) | Answer | Evidence |
|---|---|---|
| #6 Pro / paid plans real? | There is no paid plan in the code: no pricing, Stripe or subscription code, and "Unlock Pro Deck" opens sign-up. Show locked levels as an honest "Coming soon". Don't design a paywall. | grep of src: no stripe or pricing hits; 03 §2 |
| #7 May we fix MDX copy? | Yes. The content lives in the repo (`src/assets/grammar/n5/*.mdx`), and the defects (stray `**`, the authoring note, empty headings, "Hover…" wording) are plain bugs. Fix them as part of the work. | 03 §5.3 |
| #4b Must URLs stay stable? | Yes, by precedent. The team already keeps old `/jlpt/*` links working with redirects (`App.tsx:279,337`). The nav labels and grouping can change, but `/grammar/:level/:chapterId/:tab` and `/kana/*` and `/kanji/*` must stay, or get redirects. | src/App.tsx |
| #10 Device split | The repo has no data. Analytics is a Cloudflare beacon only (`src/lib/analytics.ts`). The page is about 8.8k px tall at 390px wide, and UIUX_STANDARDS §9 asks for mobile-first, so **design mobile-first**. The owner can check Cloudflare. | src/lib/analytics.ts; 03 §5.2 |
| Design principles | These are already set: calm, premium, authentically Japanese, one fox-orange accent, hierarchy through type and space, quiet motion, dark-mode parity, WCAG AA, touch targets ≥ 44px. The new system extends these rules. It does not replace them. | docs/UIUX_STANDARDS.md §0–§9 |
| Status of the existing plan | UIUX_PLAN U0 is done. Parts of UIUX_PLAN (the home table) are out of date. Treat UIUX_STANDARDS as the rules. | docs/UIUX_PLAN.md; 03 §5.10 |
| Furigana / "Show All Hints" | This is a bug, not a preference. Replace it with a Furigana on / hover / off toggle. | 04 §B1–B2 |

## Assumptions with defaults (state them; the user can override)
1. **Deliverable**: first the extracted system (tokens, primitives, inventory), then the new design system as a reviewable artifact plus a redesigned grammar chapter mock-up (desktop and mobile, both themes). Repo code changes come after sign-off, done by the agents through refactor-consolidator and component-builder.
2. **Keep the brand**: the fox-orange accent, the calm look, light and dark themes. The inner pages use the app `surface/*` tokens. `home-*` is limited to the home page unless the user picks a unified look (Q4).
3. **Accessibility is fixed** and not up for debate: AA contrast, 44px targets, reduced motion, selectable Japanese text, `lang="ja"`.
4. **One progress model** per chapter: merge the completed flag, the mastered words and the exercise and vocab bests.
5. **Honest CTAs**: "Find my starting point" either opens the existing LevelPicker or is renamed.
6. **Sub-nav naming is the same across Kana, Kanji and Grammar**, for example Learn · Words/Chart · Practice · Tests · Downloads.
7. **A guest without an account** can read every note. Practice keeps its sign-in gate, with a clear prompt explaining why.

## Questions for the user (max 4; recommended option first)
```json
[
  {
    "question": "How much of the site should the new design cover?",
    "header": "Scope",
    "options": [
      {"label": "Lessons + menu (Recommended)", "description": "Redo all lesson pages (grammar, kana, kanji) and clean up the top menu so it's easy to find things."},
      {"label": "Only grammar page", "description": "Just fix /grammar pages like N5 chapter 2. Other pages stay as they are."},
      {"label": "Whole website", "description": "New design for everything: home, lessons, quiz, dashboard, classes."}
    ]
  },
  {
    "question": "Who should the design help most?",
    "header": "Main user",
    "options": [
      {"label": "Total beginners (Recommended)", "description": "People new to Japanese. Very clear 'start here' and 'next step' on every page."},
      {"label": "Returning learners", "description": "People who already study here. Fast 'continue where you left off' and daily review."},
      {"label": "Both equally", "description": "Guests see 'start here', signed-in users see 'continue'. A bit more work."}
    ]
  },
  {
    "question": "In a chapter, should Grammar, Vocabulary, Exercise and Listening be steps in order?",
    "header": "Lesson flow",
    "options": [
      {"label": "Guided steps, skippable (Recommended)", "description": "Show 1-2-3-4 steps with ticks and a 'Next step' button, but users can still jump to any tab."},
      {"label": "Strict steps", "description": "Users must finish each step before the next opens. The chapter completes automatically."},
      {"label": "Keep free tabs", "description": "Tabs stay equal like now. We only make each tab cleaner."}
    ]
  },
  {
    "question": "What feel do you want for the new look?",
    "header": "Look & feel",
    "options": [
      {"label": "Calm, but clearer (Recommended)", "description": "Keep the calm Japanese style and fox orange, with less clutter and bigger, clearer headings and steps."},
      {"label": "Friendly and playful", "description": "More colour, the fox mascot, badges and fun feedback, like a learning game app."},
      {"label": "Match the home page", "description": "Make lesson pages look like the current home page (same colours, photos and fonts)."}
    ]
  }
]
```

### Why these 4 (and not the others)
- Scope (03 #1, #4a, #5) sets how big the design system is and whether nav and home are included.
- Main user (03 #2) decides the single primary CTA on every screen, which is the core of "easy to navigate".
- Lesson flow (03 #3) is the biggest structural decision on the page they named.
- Look & feel (03 #8) settles "too simple vs too complex" visually, and whether to unify the `home-*` and `surface-*` tokens.
- Deliverable (03 #9) is left as an assumption (artifact first, then code) because either answer leads to the same first output.
