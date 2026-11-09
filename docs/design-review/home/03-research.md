# 03 — Home page research: engaging guest home + signed-in home for FoxSensei

Date: 2026-11-09 · Method: WebSearch only (WebFetch not used; **no primary page was opened**, so everything below is from search-result snippets). The confidence column shows how reliable each claim is. Vendor and blog figures are labelled as such. Where search did not surface the primary source (e.g. NN/g's own carousel and homepage articles), I say so.

Facts FoxSensei can claim (the only ones used in the copy below): free · 46 hiragana + 46 katakana · JLPT N5/N4 kanji · 25 N5 grammar chapters · up to 19 exercise types per chapter · audio voices · classes · spaced review.

---

## 1. What makes learning-product landing pages engaging and convert

### 1.1 First-seconds clarity
- **Claim:** visitors decide quickly whether a page is relevant. Secondary sites cite NN/g's 2011 finding that "users often leave Web pages in 10–20 seconds, but pages with a clear value proposition can hold people's attention for much longer". The "5-second test" is the standard check: show the page for five seconds, then ask "what is this and would you stay?". Confidence: medium (NN/g's original was not surfaced). The "50 ms first impression" figure comes from Carleton/Microsoft research, not NN/g.
  - [principles.design — 5 fundamental principles of homepage design](https://principles.design/examples/5-fundamental-principles-of-homepage-design) · [UX Helpdesk — the 5-second test](https://uxhelpdesk-bullet.pages.dev/the-5-second-test-making-your-value-proposition-visible/) · [DigitalMarketer — 7-second test](https://www.digitalmarketer.com/blog/7-second-test-converting-homepage/)
- **What it means for us:** the hero H1 must name the subject (Japanese reading) and the outcome. A teardown of Brilliant's landing page says its biggest flaw is a hero that says "learn by doing" without naming a subject. The interactive visuals do the selling, but the subject is unclear. [Landing Doctor — Brilliant teardown (Jun 2026)](https://landingdoctors.com/teardowns/brilliant-org) (commercial audit, opinion).

### 1.2 Show, don't tell: let the product be the hero
- **Duolingo lets people use the product before signing up.** The first lesson comes before any account request. Signup prompts appear at natural moments, such as after a finished lesson, when people want to save their progress. Duolingo's former growth VP Gina Gotthilf describes a staged method: put a soft wall after the first value moment, another soft wall after more engagement, then test a hard wall and measure drop-off at each. No published effect size for delayed signup was found. Confidence: medium on the pattern, low on numbers.
  - [Taplytics — How Duolingo A/B tested delayed sign-ups](https://taplytics.com/blog/duolingo-ab-test-onboarding) · [First Round Review — tenets of A/B testing from Duolingo's growth hacker](https://review.firstround.com/the-tenets-of-a-b-testing-from-duolingos-master-growth-hacker) · [Appcues GoodUX — Duolingo onboarding](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- **Interactive demos:** SaaS vendors report large lifts (e.g. "up to 10×", "1.7× signups"), but these all come from companies that sell demo tools and none is controlled. Treat this as directional only. [Navattic — State of the Interactive Product Demo 2025](https://navattic.com/report/state-of-the-interactive-product-demo-2025) · [HowdyGo — Flagsmith 1.7×](https://howdygo.com/customer-stories/flagsmith) · [Chameleon — interactive demo best practices](https://www.chameleon.io/blog/interactive-demo-best-practices)
- **Fit for us:** reading kana is a "value in 60 seconds" skill. Tofugu's guide promises hiragana "in hours or days, not weeks", and one of its pages says you'll "be able to read hiragana sometime later today". This shows a fast, concrete first win is credible in this field. We may use the *pattern* (fast first win), but **not their copy**. [Tofugu — Learn Hiragana](https://tofugu.com/japanese/learn-hiragana/) · [Tofugu — best kana resources](https://www.tofugu.com/japanese/best-hiragana-and-katakana-learning-resources)

### 1.3 One primary CTA
- An Unbounce benchmark of 18,639 landing pages, reported second-hand, found average conversion of **13.5% with one CTA**, 11.9% with two and 10.5% with three or more. This is a correlation, not proof. CXL warns that removing a choice buyers actually need can backfire: one pricing test lost nearly 40%. **So:** one primary action ("Start reading — free") plus at most one quiet secondary action (sign in, or "see the course map").
  - [MarketingProfs — Unbounce benchmarks](https://www.marketingprofs.com/charts/2018/33935/what-converts-web-landing-page-benchmarks-and-trends-infographic) · [CXL — paradox of choice](https://cxl.com/blog/does-offering-more-choices-actually-tank-conversions/) · [CXL — long vs short form](https://cxl.com/long-form-or-short-form/)

### 1.4 Honest social proof
- The consensus (vendor and agency sources; NN/g not surfaced) is that specific, attributable proof beats vague praise. Anonymous or stock-photo testimonials can *lower* trust. Proof works best placed near the decision point.
  - [Ryviu — names/photos/context in testimonials](https://www.ryviu.com/blog/the-impact-of-real-names-photos-and-context-on-testimonial-credibility) · [KlientBoost — landing-page social proof](https://klientboost.com/cro/landing-page-social-proof/)
- **Fit for us:** FoxSensei has no verified testimonials or user counts. Its honest proof is **the product itself**: the counts above (46/46, 25 chapters, 19 exercise types), a live mini-lesson, a sample of the audio, and a transparent curriculum map. "Content proof" stands in for "crowd proof" until there is real, consented user feedback.

### 1.5 Progress / goal framing and curriculum maps
- Duolingo replaced its skill tree with **a single guided path** (Nov 2022) because users "wanted more guidance … with less complexity". Reception was mixed: some users disliked being locked into one route. LingoDeer made a similar move to "a single path … which makes choosing the next lesson clearer". **Takeaway:** show one recommended path, but don't hide the full map. [Duolingo blog — new home screen](https://blog.duolingo.com/new-duolingo-home-screen-design) · [PiunikaWeb — path backlash](https://piunikaweb.com/2022/10/17/duolingo-app-update-with-path-ui-faces-backlash-from-users/) · [LingoDeer update log](https://blog.lingodeer.com/update-log/)
- Duolingo reports, from survey data, that learners who reach a 7-day streak are about 3.6× more likely to finish a course. This is correlational. [Duolingo — streak research](https://blog.duolingo.com/duolingo-streak-research/)

### 1.6 Motion that explains, not decorates
- WCAG 2.2.2 (Level A): anything that moves or auto-updates on its own for more than 5 s, alongside other content, needs pause/stop/hide. WCAG 1.4.2: audio that autoplays for more than 3 s needs its own controls. The safest choice is no autoplay at all. Respect `prefers-reduced-motion` (search did not surface a primary source for it; it is the MDN/CSS standard). Good uses of motion: stroke-order drawing of a kana, a card flip on reveal, the progress ring filling after a correct answer.
  - [W3C — Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) · [W3C — Understanding 1.4.2](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html) · [Deque axe — no-autoplay-audio](https://dequeuniversity.com/rules/axe/4.9/no-autoplay-audio)

---

## 2. How comparable products split guest vs signed-in home (patterns only)

We describe structure only. **We do not copy any look, mascot, wording or branding.**

| Product | Guest home pattern | Signed-in home pattern | Source / confidence |
|---|---|---|---|
| Duolingo | One CTA "get started" + "I already have an account"; the lesson comes before signup; signup prompts appear after the first win | A single path with the next node highlighted; streak and daily goal shown up top; streak freezes (holding up to 2 at once gave a +0.38% DAU lift); "commit to my goal" wording raised retention | [blog](https://blog.duolingo.com/new-duolingo-home-screen-design), [streak research](https://blog.duolingo.com/duolingo-streak-research/), [Lenny's](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks) — medium/high |
| WaniKani | Explains the method and what you'll learn | Dashboard: **Lessons N / Reviews N** counts with a clear start button, a **review forecast** for upcoming hours and days, and **level progress** for the current level's items | [KB — review forecast](https://knowledge.wanikani.com/getting-started/review-forecast), [KB — level progress](https://knowledge.wanikani.com/widgets/level-progress/) — high |
| Bunpro | Grammar SRS pitch focused on JLPT | Dashboard with **Study** (new items at the target JLPT level), **Review** (due queue) and browsable content; JLPT progress bars fill up over time | [Tofugu review](https://tofugu.com/reviews/bunpro), [FAQ](https://community.bunpro.jp/t/bunpro-faq-frequently-asked-questions) — medium (may be dated) |
| Busuu | Course and outcome pitch | **Study Plan**: choose days and minutes, 5–30 min per day, 10 recommended; offered *after* a unit is finished (Premium only) | [Help — Study Plan](https://help.busuu.com/hc/en-us/articles/16097312171153-What-s-a-Study-Plan-How-do-I-make-one), [blog](https://blog.busuu.com/new-feature-study-plan-achieve-language-learning-goals/) — high |
| LingoDeer | App pitch | Single lesson path on the home screen (2022) | [update log](https://blog.lingodeer.com/update-log/) — medium |
| Renshuu | — | Dashboard: progress, daily challenges, preset schedules that automatically decide which items are due; **reviewers say it overwhelms beginners** | [Coto review](https://cotoacademy.com/learning-japanese-with-renshuu-app-review/), [WK forum](https://community.wanikani.com/t/can-someone-who-uses-renshuu-help-me-understand-the-workflow/18056) — medium |
| Memrise | — | Home screen redesigned for "clarity and confidence" with a Learn → Immerse → Communicate structure | [Memrise blog](https://www.memrise.com/blog/team-update-prototype) — low/medium |
| Khan Academy | Mission and subjects | "Learner Home" is the first page after login: active/past goals, a **course-mastery bar** that leads to recommended next content, and mastery % (Proficient or Mastered skills) | [KA Help — Learner Home](https://support.khanacademy.org/hc/tr/articles/360030629852-What-is-my-Learner-Home-page-and-what-can-I-do-there) — high |
| Brilliant | Interactive visuals in the hero do the selling (criticised for not naming a subject) | not researched (search returned nothing) | [Landing Doctor](https://landingdoctors.com/teardowns/brilliant-org) — medium |
| Tofugu / Kanshudo | Free content leads: a long, mnemonic-rich kana guide with quizzes and worksheets | not researched | [Tofugu](https://tofugu.com/japanese/learn-hiragana/) — high |

**Patterns that recur on signed-in homes:** (1) **one "Continue" action** pointing to the exact next item; (2) **Reviews due N** with one button and an optional forecast; (3) a small, selectable **daily goal** in minutes or items; (4) a **streak** with built-in protection; (5) **current-level / JLPT progress** bars; (6) one or two **recommendations**. Products that show everything at once (Renshuu) are criticised as overwhelming. Path-only products (Duolingo 2022) were criticised for being rigid.

---

## 3. Engagement mechanics for a CALM brand

- **Streaks with grace.** Streaks work largely through loss aversion (Duolingo says so itself), which can turn into anxiety. Practitioner writing (Yu-kai Chou, citing Silverman & Barasch 2023, not verified) says a broken long streak can push engagement *below* baseline, and recommends grace periods and recovery from day one. Habit research (Lally et al., cited second-hand) found one missed day had no significant effect on habit formation. **Design:** count *days studied this week* (e.g. "4 of 7") or a streak with an automatic 1-day grace per week. Never show "you lost your streak!" alarms and never sell streak protection. [Duolingo — streak builds habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit) · [Yu-kai Chou — recovery-first streaks](https://yukaichou.com/gamification-analysis/recovery-first-streak-design/) · [Yu-kai Chou — streak burnout](https://yukaichou.com/gamification-analysis/streak-design-gamification-motivation-burnout/)
- **Small daily goals.** Busuu's 5–30 min picker with 10 recommended is a calm benchmark. Offer the goal *after* the first completed lesson, not as a wall. Duolingo's anecdote is that the commitment itself, not the chosen number, did the work. [Busuu Help](https://help.busuu.com/hc/en-us/articles/16097312171153-What-s-a-Study-Plan-How-do-I-make-one) · [Lazyweb — streak goals](https://lazyweb.com/research/duolingo-streak-goals-retention) (anecdotal)
- **Word / kana / kanji of the day.** A single card with the character, reading, audio button (tap to play, never autoplay) and an example. It is cheap to build, changes daily and gives guests a reason to come back. Use the same card for guests and signed-in users, and deep-link it to the relevant lesson.
- **60-second try-it widget (guest hero).** "Read 3 hiragana": あ → い → う with a tap-to-hear button, one multiple-choice check each, and a finish screen that says "You just read あい (love)". Progress is kept locally, and "Save your progress — free" appears *after* the win (Duolingo's soft wall). It must work with keyboard and screen reader, and with reduced motion.
- **Visible curriculum progress.** A horizontal map: Kana (46+46) → N5 kanji → N5 grammar (25 chapters) → N4 kanji. Guests see it as an overview; signed-in users see it filled in with their own progress.
- **Honest "What's new" strip.** At most one or two items, static (no carousel), each a real shipped feature with a link, e.g. "New: up to 19 ways to practise every chapter". Remove items after about 4–6 weeks.

---

## 4. Japanese-specific hooks
- **"Read your first Japanese word in about 2 minutes."** Kana-first beginners can genuinely do this with あい / いえ / うえ, which use only あいうえ plus a small set of characters. Keep the claim true by making the widget's word use only characters taught in it.
- **Interactive kana grid.** A gojūon grid with tap-to-hear. Cells the learner has learned fill in (signed-in) or light up as the widget teaches them (guest).
- **Path N5 → N1 shown honestly.** Show the full JLPT ladder, label N5/N4 as **available** and N3–N1 as **not yet / planned**. Never imply content that does not exist.
- **Audio as a trust signal.** One audio sample played on tap ("Hear it"), with a note about the voices.
- **Classes** as a secondary block for people who want a human or a structure.

---

## 5. Pitfalls to avoid
| Pitfall | Why | Source |
|---|---|---|
| Fake counts / testimonials ("10,000 learners!") | The FTC's 2022 dark-patterns report lists fake social proof first, along with fake urgency and fake countdowns. It hurts trust and has legal risk | [AGG — FTC blacklists dark patterns](https://www.agg.com/news-insights/publications/the-ftc-blacklists-dark-patterns/), [Cozen — unpacking dark patterns](https://www.cozen.com/news-resources/publications/2025/unpacking-dark-patterns), [OECD report](https://one.oecd.org/document/DSTI/CP(2021)12/FINAL/en/pdf) |
| Confirmshaming ("No thanks, I don't want to learn") | A named dark pattern; it clashes with a calm brand | [Baker Law](https://www.bakerlaw.com/insights/dark-patterns-go-international-ftc-and-international-consumer-protection-networks-conduct-sweep-of-deceptive-design-practices-related-to-subscription-services-privacy) |
| Auto-rotating hero carousel | NN/g (via secondary reports) found users missed even the most prominent slide; auto-advance takes away user control and fails WCAG 2.2.2 without a pause control | [CXL — don't use auto sliders](https://conversionxl.com/blog/dont-use-automatic-image-sliders-or-carousels), [Yale usability](https://usability.yale.edu/usability-best-practices/hero-imagescarousels), [Silktide](https://silktide.com/blog/stop-using-carousels-on-websites/) |
| Autoplay audio | Fails WCAG 1.4.2 if longer than 3 s; startles users; browsers block it anyway | [W3C 1.4.2](https://www.w3.org/WAI/WCAG21/Understanding/audio-control.html) |
| Heavy hero video / Lottie / globe in the hero | Video LCP is measured from the poster; preload the poster with `fetchpriority="high"` and lazy-load the rest | [web.dev — video performance](https://web.dev/learn/performance/video-performance?hl=en), [web.dev pattern](https://web.dev/patterns/web-vitals-patterns/video/video/), [DebugBear — video LCP](https://www.debugbear.com/blog/optimize-video-lcp) |
| Streak guilt / fear mechanics, paid streak protection | Turns motivation into loss-aversion anxiety; churn after a break | [Yu-kai Chou](https://yukaichou.com/gamification-analysis/streak-design-gamification-motivation-burnout/) |
| Dashboard overload | Renshuu's dashboard is reported as overwhelming for beginners | [Coto Academy](https://cotoacademy.com/learning-japanese-with-renshuu-app-review/) |
| Signup wall before value | Goes against the lesson-first evidence | [Taplytics](https://taplytics.com/blog/duolingo-ab-test-onboarding) |
| Vague hero | Visitors can't tell what is taught (the Brilliant critique) | [Landing Doctor](https://landingdoctors.com/teardowns/brilliant-org) |

---

## 6. Pattern table

| Pattern | Evidence | Fit for FoxSensei | Risk |
|---|---|---|---|
| Try-it widget in the hero (learn 3 kana, no signup) | Duolingo lesson-first; vendor demo lifts (weak) | **High.** Kana is a 60-second skill | Widget JS weight affects LCP; lazy-load the interactive part with a static first frame |
| Soft signup wall after the first win | Gotthilf staged walls | **High** | Nagging if repeated; show at most once per session |
| One primary CTA + one quiet secondary | Unbounce 13.5% vs 10.5% (correlational); CXL caveat | **High** | Hiding sign-in hurts returning users; keep it in the header |
| Subject + outcome in the H1 | 5-second test; Brilliant critique | **High** | Over-long H1; keep to 8 words or fewer |
| Content proof (real counts) instead of crowd proof | FTC on fake proof; testimonial-credibility research | **High** | Numbers must match the data; source them from config/content, never hardcode |
| Curriculum map Kana → N5 → N4 (N3–N1 "planned") | Duolingo/LingoDeer path; KA mastery bar | **High** | Implying content that doesn't exist; label it clearly |
| Single "Continue" action (signed-in) | Duolingo path, KA Learner Home, WK/Bunpro | **High** | Needs a reliable "last position" in data |
| Reviews due + forecast | WaniKani, Bunpro | **High** (spaced review exists) | A big backlog number is stressful; cap the display ("40+") and offer a "do 10" option |
| Daily goal in minutes, offered after a lesson | Busuu Study Plan; Duolingo commitment copy | **Medium/high** | Guilt if missed; no red alerts |
| Weekly-days count / streak with grace | Duolingo freezes +0.38% DAU; Lally; Chou | **Medium/high** (calm version) | Plain streak = anxiety; never monetise it |
| Kana/word of the day (tap audio) | Common pattern; no hard data | **Medium** | Stale content; needs a ~365-entry rotation |
| "What's new" static strip (1–2 items) | Honest promotion; carousel evidence says static | **Medium** | Old news; remove after about 6 weeks |
| Explanatory motion (stroke order, ring fill) | WCAG 2.2.2; reduced-motion | **Medium** | Decorative motion and jank; honour reduced-motion |
| Hero video / auto carousel | NN/g via CXL; web.dev LCP | **Low / avoid** | LCP, banner blindness, a11y |
| Testimonials / user counts | Need real, consented data | **Later**, only with real data | Fake proof = FTC risk and broken trust |

---

## 7. Recommended GUEST home outline (top → bottom)

1. **Header:** logo, Course map, Classes, **Sign in** (quiet), **Start free** (primary).
2. **Hero (split):** left side has an H1 like "Learn to read Japanese — free", a one-line sub ("Kana, JLPT N5–N4 kanji and 25 N5 grammar chapters, with spaced review and audio."), the primary CTA and a secondary text link ("See the full course"). Right side has the **Try it: read 3 hiragana** widget. A static card renders first (counts toward LCP); the interactive part hydrates lazily. No autoplay, reduced-motion safe.
3. **After the widget's win:** inline "You read あい. Save your progress — free" (soft wall). Guest progress is kept locally and moved to the account on signup.
4. **Proof strip (real numbers):** 46 hiragana · 46 katakana · N5 + N4 kanji · 25 grammar chapters · up to 19 exercise types per chapter.
5. **Curriculum map:** Kana → N5 kanji → N5 grammar → N4 kanji, with N3–N1 greyed as "planned". Each stage links to a preview.
6. **How a chapter works:** three steps (learn → practise in up to 19 ways → spaced review). Each step has a tiny static illustration and the audio "Hear it" sample button.
7. **Kana / word of the day** card (shared with the signed-in view).
8. **What's new** (1–2 static items).
9. **Classes** block (secondary audience).
10. **FAQ** (free? how long? do I need kana first? JLPT?) — honest answers.
11. **Closing CTA**, the same single action, then the footer.

## 8. Recommended SIGNED-IN home outline

1. **Greeting + today line:** "おかえり, {name}" plus a single sentence plan ("Today: 12 reviews and 1 new chapter, about 10 min").
2. **Continue card (primary):** the exact next item (e.g. "Grammar ch. 7 — exercise 4 of 19") with one big button and a progress bar for that chapter.
3. **Reviews due:** a count capped as "40+", a **Start review** button, an optional **"Just 10"** button, and a small forecast for the next 24 h. When nothing is due, show the empty state "All caught up — next review in 3 h".
4. **This week:** days studied (e.g. "4 of 7", with grace) and a daily-goal ring (minutes, chosen by the user, editable). No red alarms.
5. **Your path:** the curriculum map filled with the learner's progress (kana grid %, N5 kanji %, grammar chapters x/25, N4 kanji %).
6. **Recommended for you (at most 2):** e.g. "Katakana is 80% done — finish the last 9", "Try listening practice for ch. 6".
7. **Kana / word of the day**, the same component as the guest view.
8. **What's new** (dismissible, remembered per user).
9. **Classes:** the next session if enrolled, otherwise a quiet link.
- Every block uses the shared loading / error / empty components. Blocks load in parallel and show skeletons; one block failing must not blank the page.

---

## 9. Ten honest promotion lines (real facts only)

1. **Learn to read Japanese — completely free.**
2. **Read your first Japanese word in about two minutes.** (true only if the hero widget delivers it; keep it so)
3. **All 46 hiragana and 46 katakana, with audio for every sound.**
4. **From your first kana to JLPT N5 and N4 kanji, step by step.**
5. **25 N5 grammar chapters, each with up to 19 ways to practise.**
6. **New: up to 19 exercise types for every chapter.**
7. **Listen as you learn: clear voice audio on every lesson.** (avoid "native" unless the voices are native recordings; "native-style" is vague, prefer a literal description)
8. **Spaced review brings back what you're about to forget, at the right time.**
9. **Prefer a teacher? Join a class.**
10. **No ads, no streak guilt — just a calm, clear path to reading Japanese.** (check "no ads" is true before using)

Copy rules: no user counts, ratings or testimonials until they are real and consented; no "limited time"; no "native speakers" unless verified; N3–N1 labelled "planned", never implied as available.

---

### Search gaps (not verified)
- NN/g primary articles (homepage clarity, carousels, social proof) were not surfaced; their findings are cited second-hand.
- Nothing came back on Brilliant's signed-in home, or on the logged-in homes of Kanshudo or Tofugu.
- Effect sizes for delayed signup and interactive demos are vendor claims or missing.
- The Silverman & Barasch 2023 and Lally et al. studies were cited second-hand and not opened.
