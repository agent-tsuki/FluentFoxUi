# Design review: Grammar N5 chapter 2 and the v2 design system

A multi-agent review of https://www.foxsensei.com/grammar/n5/2 ("looks too simple and also complex; users should be able to navigate and use the site easily"). The result is the **FoxSensei Design System v2** (Design System artifact: tokens, brand book and 19 component/page previews).

| # | Agent (`.claude/agents/`) | Report |
|---|---|---|
| 1 | `design-auditor`: current design inventory | [01-current-design.md](01-current-design.md) |
| 2 | `design-cross-examiner`: cross-questions 1 and 4, finds misses, TOP 15 | [02-cross-exam.md](02-cross-exam.md) |
| 3 | `product-context-researcher`: product, audience, intent | [03-context-intent.md](03-context-intent.md) |
| 4 | `ui-ux-reviewer`: UI/UX review of the page | [04-uiux-review.md](04-uiux-review.md) |
| 5 | `design-manager`: checks that agents used the right standards and information | 05-manager-audit.md |
| 6 | `user-intent-evaluator`: what the user told us and what to ask | [06-user-info.md](06-user-info.md) |

User decisions: [00-user-answers.md](00-user-answers.md).

Run order: 3 → (1, 4 in parallel) → 6 (questions to the user) → 2 → build → 5.

Note: this branch is one commit behind `origin/main` ("added voice" rewrote the Exercise tab and removed `PracticeIntro.tsx`). Implementation should start from `origin/main`.
