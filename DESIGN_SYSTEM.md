# جمّول — Design System (builders' guide)

Source of truth: the official identity PDF ("الملف المقترح لهوية منصة جمول"). The reference website was used only for
the *idea* of the product (categories, cast, features), never for layout. Same brand, different creative direction.

## 0. Hard rules for every page you touch
1. **Keep every feature, route, data flow and store key.** You are restyling, not removing. Do not rename exports other files import.
2. **No legacy visuals.** Do not use anything under `public/img/` that is 3D / generic-AI: `badges/`, `games/`, `icons3d/`, `world/`,
   `ajyal-area-*`, `ajyal-hero-*`, `ajyal-jamool-*`, `ajyal-noor-*`, `ajyal-*-scene*`, `ajyal-avatar-*`, `ajyal-final-cta*`, `ajyal-games-world*`,
   `ajyal-learn-letters*`, `ajyal-values-garden*`, `ajyal-creative-studio*`, `ajyal-storyworld*`, `ajyal-room-hero*`, `ajyal-world-map*`.
   Allowed images: `public/brand/*` (official cast + logos), `public/img/stories/*` (new covers), `ajyal-art-*.jpg` (coloring line-art).
3. **Never redraw or recolor the characters.** Use `<Character name="…" />` only.
4. **One icon system:** write `<i className="ri-…" />` as before. A global stylesheet maps every `ri-*` class to Google Material Symbols
   Rounded (filled, weight 500). Do not import any other icon set, never use emoji as icons, never inline random SVG icons.
   Wrap category glyphs in `<CategoryTile category="games" />` (soft tinted rounded tile).
5. **Colorful but controlled.** One category colour per page/section. Navy + cream do the heavy lifting; saffron is the playful accent.
   Never place more than 2 of the 7 tones on one screen region.
6. **Arabic first, RTL.** Use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Numbers shown to kids use `toLocaleString("ar-EG")`.
7. **Mobile is a product, not a squeezed desktop.** Test 375px: no horizontal scroll, touch targets ≥ 44px, characters sit in flow (not absolutely
   positioned over text), decorative elements hidden `hidden md:block`.
8. **Accessibility:** visible focus (global), `alt` on meaningful images, `aria-hidden` on decoration, real `<button>`/`<a>`, contrast ≥ 4.5:1.

## 1. Colour tokens (Tailwind scales 50–950, defined in `src/index.css`)
| Token | Brand colour | Role |
|---|---|---|
| `foreground-*` | Navy `#1F2A5C` (900) | text, headings, dark sections (`bg-foreground-900`), secondary buttons |
| `background-*` | Cream `#FFF4DE` (100) | page = `background-50`, soft panels = `background-100/200`, borders `background-200/300` |
| `primary-*` | Saffron `#FFC43D` (500) | primary CTA, stars, points, achievement glow |
| `secondary-*` | Coral `#F0563A` (500) | energy: games, challenges, alerts of delight |
| `accent-*` | Turquoise `#1E9E96` (500) | surahs, exploration, positive states |
| `sky-*` | Blue `#2F7BEA` | learning, Zizo / AI, interactive info |
| `violet-*` | Purple `#8D6BEB` | stories, imagination |
| `amber-*` | Orange `#F5A63A` | Jamool's warmth, art |
| `leaf-*` | Green `#3E9E6A` | values garden, success |

Category → tone (use `src/data/brand.ts`: `categories`, `tones`, `categoryById`):
stories violet · learning sky · surahs turquoise · games coral · art amber · AI sky · values leaf · competitions saffron · video coral.
`tones[tone]` gives literal class strings: `tile, solid, soft, chip, text, bar, ring, border`.

Surfaces: page `bg-background-50`; section tint `bg-background-100`; category tint `tones[x].soft`; dark band `bg-foreground-900 text-background-100 on-navy`.
Never use raw hex in components. Never use gray/slate/zinc/stone/indigo/pink/purple/green Tailwind default colours.

## 2. Typography
Headings: **Readex Pro** (`font-heading`), body: **Tajawal** (`font-body`, default). `h1–h5` already get heading font, navy, line-height 1.32.
| Level | Classes |
|---|---|
| Display (hero only) | `font-heading font-bold text-4xl md:text-6xl leading-[1.2]` |
| H1 (page) | `text-3xl md:text-[2.75rem] font-bold` |
| H2 (section) | `text-2xl md:text-4xl font-bold` |
| H3 (card) | `text-lg md:text-xl font-bold` |
| Body | `text-base leading-relaxed text-foreground-600` (lead: `md:text-lg`) |
| Caption | `text-xs font-medium text-foreground-500` |
| Button | `.btn` (Readex 600) |
Weights: 700 for headings, 500/700 for UI, 400 body. Never `font-extrabold`/`font-black`. Max line length ≈ 65ch for paragraphs.

## 3. Buttons (CSS classes in `index.css`)
`btn btn-primary` (saffron, tactile 4px base) · `btn btn-secondary` (navy) · `btn btn-ghost` (outline) · sizes `btn-sm`, `btn-lg` ·
icon button `btn-icon`. Disabled via `disabled`. On navy backgrounds wrap with `on-navy` so ghost turns cream.
One primary button per view region. Examples: `<button className="btn btn-primary btn-lg"><i className="ri-play-fill" />هيا نبدأ</button>`.

## 4. Cards (one family, different personalities)
Base `card` (cream-50, 28px radius, soft navy shadow, 1px navy/6% border) + `card-hover` for lifting links.
Variants (compose with Tailwind): **story card** = cover image on top (aspect-[4/3], rounded-2xl) + tag chip + title + age/time;
**activity card** = `CategoryTile` + title + one-line goal + start button; **challenge card** = `tones.secondary.soft` bg + Thaloob;
**character card** = tinted stage + `Character`; **progress card** = `ProgressBar` + count + medal.
Padding `p-5 md:p-6`, gap 3–4, title H3, CTA at bottom. Do not nest cards in cards.

## 5. Icons & tiles
`<CategoryTile category="stories|learning|surahs|games|art|ai|values|competitions|video" size="sm|md|lg" solid? />` or
`<CategoryTile icon="ri-…" tone="leaf" />`. Inline glyphs inside text/buttons: `<i className="ri-…" />` (inherits colour/size).
Outline-state variants (`ri-star-line`, `ri-heart-line`) show an unfilled glyph for "off" states (empty stars).

## 6. Characters (official cast, `src/data/brand.ts`)
| Character | Where he/she appears | Never |
|---|---|---|
| **جمّول** (camel) | hero, welcome/onboarding, stories, learning, success moments, empty states, progress encouragement | everywhere at once |
| **ثعلوب** (fennec fox) | games, challenges, puzzles, competitions | values / art pages |
| **زيزو** (robot) | `/ai`, smart help, "ask", discovery | stories |
| **نور** (hoopoe) | values garden, surahs, guidance, parents' tips of behaviour | games |
| **مها** (gazelle) | drawing, colouring, art, creativity | quiz |
`<Character name="jamool" size="xs|sm|md|lg|xl|2xl" motion="still|float|wave|cheer" small flip decorative priority />`.
One character per screen region; speech bubbles: `rounded-3xl bg-background-50 p-4 card` with Character beside it (not over text).
Logo: `<Logo className="h-12" />`; owner mark: `<OwnerMark />`. Never recolor/stretch.

## 7. Page header
Inner pages use `ModuleHero` with `category="…"` (picks tone + character): `badge`, `badgeIcon`, `title`, `description`, `actions`.
Legacy props `image*`, `tone`, `floatIcon` are ignored — you may delete them at call sites.

## 8. Gamification (single system)
Points/stars = saffron star (`<i className="ri-star-fill text-primary-500" />`). Badges = `<Medal id=… earned size=… />` (never PNGs).
Progress = `<ProgressBar value tone label />`. Success: `useRewards().earn(...)` (toast + medal pop with Jamool cheer).
Levels / streak: use `primary` + `amber`. Never invent a new reward visual.

## 9. Motion (GSAP lives in `src/lib/gsap.ts` + `MotionLayer`)
Global reveals already animate `main > section h2` and `main > section ul > li` (batch, stagger). Don't add parallel reveal animations.
CSS micro-interactions only (150–250 ms, ease-out): hover lift (`card-hover`), icon nudge `group-hover:-translate-y-0.5`, tile wiggle.
Character motion via the `motion` prop. Respect `prefers-reduced-motion` (wrap custom keyframes in `motion-safe:`).
If you use GSAP in a component: `useGSAP` from `@/lib/gsap`, scope refs, `gsap.matchMedia()` with `MOTION_OK_QUERY`, animate transform/opacity only.

## 10. Heritage motifs (subtle)
`.sadu-band` (section base / divider), `.najdi-zigzag` (header underline, empty areas), `.pattern-diamond` / `.pattern-diamond-navy`
(very low-contrast backgrounds for dark/empty areas). Max one motif per section; never behind body text.

## 11. Parent area (`/parent`, settings, time limits)
Calmer: no characters except a small Noor tip, no motion beyond fades, white/cream surfaces, navy type, data in tables/cards with `ProgressBar`,
turquoise = fine, coral = needs attention. Same tokens, same buttons, fewer decorations.

## 12. Copy tone
Short, warm, encouraging Arabic: «هيا نكتشف» «جاهز للمغامرة؟» «تعال نجرّب» «أحسنت!» «جمّول مستنيك!». No baby talk, no technical words, no long paragraphs for kids.

## 13. Done checklist (per page)
tsc passes · no `ajyal-*`/`badges`/`games`/`icons3d`/`world` image paths left · no raw hex or default Tailwind colours · one category tone ·
characters from `<Character>` only · RTL logical classes · 375px has no horizontal scroll · focus visible · features still work.


## 9. Visual refinement of the home page (read this before touching a home section)

**Benchmarks (LOCKED, never edit):** `Footer.tsx`, `TrailSection.tsx` («اختر بابًا»). The hero + header are done (do not edit).
What makes the two benchmarks feel premium, and what every other chapter must borrow (principles, not layout):
- ONE focal point per scene (a character or one big shape), everything else clearly secondary. Few words: one-word labels, one short line.
- Flat, saturated brand colour shapes with generous empty space. No glassy gradients, no glow, no emoji.
- The signature shape is the **arch (door)**; supporting vocabulary = sparkle, dashed ring, squiggle, sadu diamond, crescent (see `components/brand/Deco.tsx`).
- Deep ground colours with a quiet pattern (`pattern-diamond-navy`) for brand moments; cream / soft tints for calm chapters.
- Characters are shown whole, large and warm, standing on or peeking out of a shape (arch / disc), never as tiny stickers.
- Cards are calm: cream or soft-tint surface, 1.75rem radius, `shadow-card`, the chapter colour appears in ONE place (an arch tile, a bar, a chip), not everywhere.

**Section rhythm (top → bottom). Each chapter owns its ground; do not change a neighbour's ground:**
| # | chapter | ground | accent tone |
|---|---|---|---|
| 1 | Hero | cream page + royal-blue panel | saffron | (done)
| 2 | Doors (`#worlds`) | royal blue `#2B2889` + diamonds | all | LOCKED
| 3 | Continue | `bg-background-50` | saffron |
| 4 | Suggested | `bg-background-100` | per card |
| 5 | Achievements | `bg-background-50` | saffron |
| 6 | Stories | `bg-violet-50` | violet |
| 7 | Learning | `bg-background-50` | sky |
| 8 | Quran | BRAND MOMENT `bg-accent-800 text-background-50 on-navy` + diamond pattern | turquoise/saffron |
| 9 | Games | `bg-background-50` | coral |
| 10 | Creativity | `bg-amber-50` | amber |
| 11 | Zizo teaser | BRAND MOMENT `bg-sky-700 text-background-50 on-navy` | sky/saffron |
| 12 | Values | `bg-leaf-50` | leaf |
| 13 | Competitions | `bg-primary-50` | saffron |
| 14 | Friends | `bg-background-50` | all five, one each |
| 15 | Parents trust | `bg-background-100` | navy/turquoise |
| 16 | Final CTA | navy + diamonds (`bg-foreground-900 pattern-diamond-navy on-navy`) | saffron |
| – | Footer | LOCKED |

**Seams.** Every section (except the last) ends with `<SectionBridge variant="…" className="text-<ground of the NEXT section>" />` as its last child
(the section needs `relative overflow-hidden`; give it enough bottom padding, e.g. `pb-20 md:pb-28`, so content does not touch the seam).
Use `arches` when leaving a dark section, `dunes` for calm→calm, `scallop` into/out of playful ones (games, competitions), `zigzag` once at most.
Never use two identical seams in a row. `ChapterWave` is retired: replace it with `SectionBridge`.

**Chapter header:** `ChapterHeader` (arch icon + title + drawing squiggle + one line). Pass `onDark` on brand-moment sections.

**Motion language (one for the whole page, handled by `MotionLayer`; you only add attributes):**
- reveal on scroll is automatic for `main > section h2`, its next `p`, and every `ul > li` (do not re-implement; opt out with `data-no-reveal`).
- `data-pop` shapes spring in once; `data-drift="n"` slow parallax; `data-draw` on an svg draws its paths; `data-bridge` is internal to SectionBridge.
- Hover: `card card-hover` (lift 3px). Character hover = tiny tilt/wiggle via GSAP in a `useGSAP` hook scoped to the section; keep it ≤ 0.4s, `power3.out` / `back.out(2)`.
- Ambient loops are rare: one slow float on the focal character, one on a decoration. Never animate everything.
- Always wrap section-level GSAP in `gsap.matchMedia()` using `MOTION_OK_QUERY`, scope with `useGSAP({ scope })`, and use hover variants only under `(hover: hover)`.
- GSAP x/y overrides Tailwind `-translate-*` centring: wrap CSS-centred elements in an outer element and animate the inner one. Never put `data-drift`/`data-pop` on an element that has Tailwind translate/scale classes.
- Decorative shapes: always `aria-hidden`, positioned `absolute`, hidden on phones unless tiny (`hidden md:block`). Max 4 per section, max 2 colours.

**Quality bar per section:** 1 focal point · 1 character or illustration at real size · 1 main action · everything else secondary · ≤ 20 words of copy visible
(keep existing functionality / links / data) · works at 375px with no horizontal scroll · touch targets ≥ 44px.
