# Classes UI Spec (/classes, /classes/:slug)

Decided spec. It overrides the reviewer notes. The owner's requests are fixed: small cards at 4–5 per row, a small hero and filter bar, no colour box, an image behind the avatar, and Meet the channel above Playlist. Tokens only. Every change must work in light and dark.

## 1. List page — `src/pages/ClassesPage.tsx`

**Page:** `<main class="min-h-dvh pt-nav pb-16">`. Use `pt-nav`, not `pt-24`. The container is `mx-auto max-w-7xl px-6 md:px-10`.

**Hero (`ClassesHero`)**: left-aligned, about 110px tall, `pt-8 pb-5 space-y-1.5`.
- h1 `font-headline text-2xl md:text-3xl font-extrabold tracking-tight`. Text: "Learn Japanese from great teachers". No orange span.
- One line, `text-sm text-on-surface-variant`: "Hand-picked YouTube playlists and courses, sorted by JLPT level · {n} courses · {m} teachers". The stats go inline.
- Remove the eyebrow pill, the icon stats row and the centring.

**Filter bar (`ClassesFilterBar.tsx`)**: not sticky (6 courses do not need it). `py-2 border-y border-outline-variant/40`.
- On desktop it is one row, `flex items-center justify-between h-12`. On mobile it is two rows: the level control first, then the chips in `flex gap-2 overflow-x-auto -mx-6 px-6 [scrollbar-width:none]` with no wrapping.
- Level segmented control: `rounded-xl bg-surface-container p-0.5`, buttons `h-8 px-3 text-xs font-bold rounded-lg`.
- Chips: `h-8 px-3 text-xs rounded-full`.
- Every control also gets `relative after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-['']`, so the hit area stays at 44px.
- Skeleton: `h-12`.

**Grid (`CourseGrid.tsx`)**:
- Base: `grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- New prop `maxCols?: 4 | 5`, default 5. 5 adds `xl:grid-cols-5`.
- At 1440 the cards are about 227px wide. At 1024 there are 4 cards of about 224px.

**Card (`CourseCard.tsx`)**: about 240px tall at 227px wide. Hover is `hover:border-outline` with no lift, keeping the image `scale-[1.03]` under motion-safe.

```
┌────────────────────┐  rounded-xl border-outline-variant/40 bg-surface-container-lowest, no shadow
│  16:9 thumbnail    │  overlay br: "12 videos · 3h" (only if known)
├────────────────────┤  p-3 space-y-2
│ Title clamp-2      │  text-sm font-bold leading-snug
│ (◯) Channel name   │  avatar sm, text-xs truncate
│ ▶ YouTube · Free   │  text-xs on-surface-variant; "Paid" in text-warning
└────────────────────┘
```
- Remove the badge pills, the summary, the tags, the level and the "View course" footer.
- `isFeatured` becomes a small `Featured` pill at the top-left of the media: `bg-surface-inverse/85 text-on-surface-inverse text-2xs`.
- **Media slot is always 16:9**, so rows line up. With `thumbnailUrl` it shows the image. Without one (Udemy/Website) it shows `bg-surface-container-high` with the platform `<Icon>` at `text-4xl text-on-surface-variant/60`. No pink wash and no avatar circle. Delete `PlatformMeta.bg`.

**Skeleton:** 8 cards with the same structure (16:9 block plus 3 lines).

**Footer CTA (`SuggestResource`)**: `mt-12`, one row `flex items-center justify-between gap-4 rounded-xl border border-outline-variant/40 px-5 py-4`. Text `text-sm` on the left, an outline link button on the right. It stacks on mobile.

## 2. Detail page — `ClassDetailPage.tsx`

**Order:** Hero → Meet the channel → Playlist → What you'll learn → Curriculum → More from channel → Similar.

**Body:** `max-w-5xl space-y-10 pt-8`, single column. No sticky rail and no mobile sticky CTA. Rails use `<CourseGrid maxCols={4}>`, which gives about 224px cards, the same as the list.

**Hero (`CourseHero.tsx`)**: plain `bg-surface` with a bottom border. Delete `heroFromClass`.
- Container `max-w-5xl pt-6 pb-8`. Layout `grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center`. With no media it is one column.
- Left column, `space-y-3`:
  - back link
  - badges
  - h1 `text-2xl md:text-3xl`
  - channel row
  - summary `text-sm md:text-base`
  - facts
  - at most 4 tags
  - CTAs
- Right column, the media card: `aspect-video rounded-2xl overflow-hidden` showing `thumbnailUrl` with the play overlay from VideoEmbed. Only rendered when `thumbnailUrl` exists.
  - If the course is playable (videos or playlistId), the card is a `<button aria-label="Play playlist">` that calls `startWatching`, which scrolls to #playlist and autoplays.
  - Otherwise it is an `<a>` to the YouTube URL (new tab).
  - On mobile it sits above the title. It is not shown at all when the course has no thumbnail.
- "Open on YouTube" href: if `playlistId` is set, use `https://www.youtube.com/playlist?list={playlistId}`, else `course.url`.

**Meet the channel (`ChannelIntroduction.tsx`)**:
- Banner strip: `aspect-[4/1] md:aspect-[6/1]`, `object-cover object-center`.
  - `bannerUrl` → the banner image.
  - No banner, or the banner fails (`onError`), but there is an avatar → the avatar as `absolute inset-0 size-full object-cover scale-150 blur-2xl` plus a `bg-surface-inverse/20` scrim.
  - Neither → no strip at all.
  - Delete the accent-colour wash. That wash is the "colour box".
- **Clipping bug:** the strip is `relative` but the avatar row is not, so the strip paints over the avatar. Give the avatar row `relative z-10 -mt-10 md:-mt-12`.
  - Avatar is `size-20 md:size-24` with `ring-4 ring-surface-container-lowest`. Remove the accent `outline`, which made a double border.
  - Name is `text-lg md:text-xl line-clamp-2`.
  - With no strip: no negative margin, and `pt-5`.
- Description and intro video: `grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem]`. The video is in the right column (VideoEmbed, about 162px tall). On mobile the video goes full width below the text.
- `ChannelAssessment`: new prop `courseSummary`. Hide teaching style when `norm(teachingStyle)` equals `norm(courseSummary)` or `norm(description)`, where norm = trim, lowercase, collapse spaces.

**Playlist (`PlaylistSection.tsx`)**: the page passes `playlistId` and `thumbnailUrl`. `hasPlaylist = isYouTube && (videos.length > 0 || !!playlistId)`.
- When there are videos, keep the current player and list.
- With only a playlistId, show one click-to-load player at `max-w-3xl`.
- Neither → do not render the section, the hero Start button or any "synced" copy.
- Below the player: `text-xs` "Videos hosted on YouTube · {channel}", linked to the channel.

**`VideoEmbed.tsx`**:
- Add an optional `playlistId` that builds `https://www.youtube-nocookie.com/embed/videoseries?list={id}&autoplay=1&rel=0`. Validate it against `/^[A-Za-z0-9_-]{10,64}$/`.
- Add `posterUrl`, which overrides the hqdefault image.
- The CSP `frame-src` only allows youtube-nocookie.com, so **do not use www.youtube.com/embed**.

**`ChannelAvatar.tsx`**: add `onError` → initials fallback (useState). Add `loading` prop, set to `eager` in the hero and the channel card.

## 3. Data-combination rules

| Data | Card media | Hero right | Channel strip | Playlist |
|---|---|---|---|---|
| YT, thumb + playlistId + videos | thumb + count | poster → play | banner | player + list |
| YT, thumb + playlistId, 0 videos (now) | thumb, no count | poster → play | banner | videoseries embed |
| YT, thumb, no playlistId | thumb | poster → external link | banner | hidden |
| YT, no thumb | icon tile | none (1-col) | banner / blurred avatar | per above |
| Udemy/Website, nothing | icon tile | none | none (no overlap) | hidden |

## 4. Wireframes

**1440, list:**
```
[nav 80]
Learn Japanese from great teachers                (h1 30px)
Hand-picked… · 6 courses · 6 teachers             (14px)
─[N5|N4🔒|N3🔒|N2🔒|N1🔒]────────[All][YT][Udemy][Web] | [Free]─  48px
[card][card][card][card][card]     5 × ~227px
[card]
[Know a resource we missed?            (Suggest)]
```
**375, list:** h1 24px, a 2-line subtitle, the level control row, a scrolling chip row, then 1-column cards (327px wide).

**1440, detail:**
```
← All classes
[YT][N5][Free]                        ┌──────────────┐
Organic Japanese… (30px)              │ thumbnail ▶  │ 20rem
(◯) Channel  ▶                        └──────────────┘
summary · facts · tags
[Start watching] [Open on YouTube]
── Meet the channel ───────────────────────────────
[ banner image 6:1                                 ]
 (◉) Name ▶  @handle · 106K   [Subscribe][Visit]
 description……………………              [intro 18rem]
 assessment
── Playlist ── ── What you'll learn ── ── Curriculum ── ── More (4-col) ──
```
**375, detail:** poster, then the title block with the CTAs stacked full width, then the channel card (4:1 banner, 80px avatar, buttons wrap, intro video below the text), then the playlist.

## 5. Dark mode and a11y

- No pink, accent or `heroFromClass` washes.
- Overlays use `surface-inverse` / `on-surface-inverse`.
- The avatar ring uses `surface-container-lowest`.
- The YouTube mark keeps its brand colours.
- Price colour is `success`/`warning` text. These must be checked for 4.5:1 contrast in both themes.
- Decorative images get `alt=""`. Avatars keep their alt text.
- Use `aria-pressed` on the filters.
- External links get the sr-only "(opens in a new tab)".
- One h1 and h2 per section.
- 44px hit areas.
- Respect `prefers-reduced-motion`.

## 6. Acceptance checklist

- [ ] At 1440, /classes shows 5 cards per row, each ≤ 240px wide and ≤ 260px tall. At 1024 it shows 4.
- [ ] The hero plus filter bar take ≤ 180px below the nav. The filter bar is one 48px row and is not sticky.
- [ ] At 375 the chips scroll horizontally, there is no page overflow, and every tap target is ≥ 44px (DevTools box).
- [ ] Udemy/Website cards show the neutral icon tile, with no tint and no empty circle.
- [ ] Blocking the avatar URL shows the initials.
- [ ] On the detail page the order is Hero, Meet the channel, Playlist, …
- [ ] The channel banner shows the real YouTube banner, and the avatar is fully visible (not clipped) over it.
- [ ] With the banner URL blocked, the strip shows the blurred avatar. A Udemy course shows no strip.
- [ ] With the current data (playlistId, 0 videos), clicking the hero poster scrolls to Playlist and the videoseries iframe plays (nocookie, no CSP error in the console). No "synced" text appears anywhere.
- [ ] "Open on YouTube" opens `/playlist?list=…`.
- [ ] Teaching style does not repeat the summary.
- [ ] The rails use 4 columns.
- [ ] Light and dark screenshots show no light-on-light or invisible borders.

Backend note: refresh stored YouTube API data at least every 30 days (YouTube ToS).
