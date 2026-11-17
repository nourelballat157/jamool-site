# Ajyal Al-Salhiya — feature extension spec (shared by all builders)

Project root: `C:\Users\Delln\AppData\Local\Claude-Data\claude_pzs8sxrjxfjjc\scratch-workspaces\08b2f512-2211-47f1-b702-715a62f76105\341f0393-596c-4886-85ef-3ae290833f2a\scratch-2026-11-11-9ee3a3\ajyal-src`
Stack: Vite + React 18 + TypeScript + Tailwind 3 + react-router-dom 6. Arabic, RTL. Alias `@` = `src`.
Node is installed: before any npm/npx command run `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.

## THE ONE RULE
The existing website design is LOCKED. We are adding **functionality** only, and every new screen must look like it was always part of this site.
- Do NOT change existing colors, fonts, images, header, footer, navigation structure, section order, or the look of existing components.
- You MAY make small, surgical edits to the existing pages that are listed in *your* task (for example turning a static card into a link, or adding one new section). Keep everything else byte-for-byte.
- Do NOT edit files that are not in your task list. If you need a change in a shared file (router, store, mocks, Navbar), do not do it: describe it in your final report and the lead will do it.

## The design system you must reuse (read 2 or 3 existing pages first!)
Read at least: `src/pages/learning/page.tsx`, `src/pages/games/page.tsx`, `src/components/feature/ModuleHero.tsx`, `src/pages/games/components/GameModal.tsx`, `src/pages/home/components/StoriesSection.tsx`.
- Page frame: `<div className="flex min-h-screen flex-col bg-background-50"><Navbar /><main className="flex-1">…</main><Footer /></div>` and `useScrollTop()` at the top of every page. Hero blocks use `ModuleHero` (props: badge, badgeIcon, badgeTone, title, description, image, imageAlt, imageTitle, tone, actions, floatIcon).
- Tokens (Tailwind classes only, never hex): `background-50…950`, `foreground-50…950`, `primary-*` (warm yellow), `accent-*` (green), `secondary-*` (pink). Soft tinted surfaces: `bg-primary-50/100`, `bg-accent-50/100`, `bg-secondary-50/100`, `bg-background-100`.
- Shapes: cards `rounded-4xl` or `rounded-3xl`, chips/buttons `rounded-full`. No heavy shadows (the site is flat and soft). Hover: `hover:-translate-y-1` or `hover:scale-105` with `transition-transform`.
- Headings `font-heading text-2xl md:text-3xl font-extrabold text-foreground-950`; body `text-sm md:text-base text-foreground-600`; containers `mx-auto w-full max-w-7xl px-4 md:px-6`; section padding `py-12 md:py-16`.
- Primary button (copy exactly): `inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-primary-500 px-6 text-sm font-extrabold text-foreground-950 transition-colors hover:bg-primary-600 cursor-pointer`. Secondary: `bg-background-100 text-foreground-700 hover:bg-background-200` or the accent/secondary equivalents (`bg-accent-500 text-background-50 hover:bg-accent-600`).
- Icons: Remix Icon classes only (`<i className="ri-star-fill" />`). No emoji in UI. No new icon libraries.
- Existing animations you may use: `animate-rise-in`, `animate-floaty`, `animate-twinkle`, `animate-celebrate-pop`, `animate-confetti-fall`, `animate-pulse`. If you need a new keyframe, put it in your own CSS file next to your page (e.g. `story.css`, imported from your page) using `oklch(var(--primary-500))`-style tokens. Respect `prefers-reduced-motion`.
- RTL: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Arrows point the RTL way (`ri-arrow-left-line` = "next").
- Mobile first. Everything must work at 375px width and with touch (no hover-only, no drag-only: always offer tap alternatives). Min touch target 44px.
- Accessibility: real `<button>`s, `aria-label`s for icon buttons, `aria-live` for feedback, visible focus (don't remove outlines), color never the only signal.
- Child-friendly tone: warm, short Arabic sentences, positive feedback only. Never "game over", no lives, no negative scores; a wrong answer says "جرّب مرة أخرى" and offers a hint.
- Do not add npm dependencies. Do not use external APIs at runtime except the audio CDN noted for Quran. No network calls otherwise.
- Images: use ONLY the existing files in `/public/img` (referenced as `/img/<name>.jpg`): ajyal-area-{competitions,content,drawing,games,letters,quran,stories,values}-01, ajyal-avatar-{boy-01,girl-01,girl-02}, ajyal-competitions-scene-01, ajyal-creative-studio-01, ajyal-games-world-01, ajyal-learn-letters-01, ajyal-noor-character-01 (the guide mascot "نور"), ajyal-quran-scene-01, ajyal-story-{deer,dolphin,garden,lion,robot,space}-01, ajyal-storyworld-hero-01, ajyal-values-garden-01, ajyal-world-map-01. New art will be generated later by the lead; design with an `image` field that can be swapped, and make screens look good with icons alone.

## Shared infrastructure (already built — import it, do not modify)
`@/store/progress` (default export hook `useProgress()` + functions):
- `useProgress()` → `{ child, data, level:{level,name,pct,toNext,next}, streak, week, count(prefix), badges[], isDone(key) }`. `data.points`, `data.marks`, `data.quran`, `data.creations`.
- `award(key, points)` is wrapped for you by the hook below. Keys are once-only; use these prefixes (badges count them): `story:<id>`, `letter:<id>`, `quran:<surahId>:<stage>` (stage s1|s2|s3), `quran-done:<surahId>`, `game:<id>`, `value-done:<valueId>`, `quiz:<id>`, `value-step:<valueId>:<station>`.
- `setMark(key, number)` generic resume data (e.g. `story:lion:page` = 3). `setQuran(surahId, {stage, verse, reps})` memorisation state. `addCreation({kind,title,image})`. `selectChild`, `addChild`, `settings`, etc. exist (the lead uses them).
`@/components/feature/RewardProvider` → `useRewards()` → `{ earn(key, points, label), notify(text, icon?), announce(result) }`. **Always** use `earn()` to give points when something is *finished* (never for just opening a page). Standard amounts: story 30, letter 15, quran stage 20 (+40 when a surah is complete), game 10, value station 10 (+50 when the value blooms), quiz 5–40 by score.
`@/hooks/useActivityProgress` → `recordActivity({key,title,subtitle,icon,route,tone})` and `completeActivity(key)` feed the home "أكمل من حيث توقفت" section. Call `recordActivity` when the child starts/continues something, `completeActivity` when finished.
`@/hooks/useArabicSpeech` → `{supported, speaking, speak, speakSequence, stop}` browser Arabic TTS (for letters, words, stories, Noor's words). **Never use TTS to read Quran verses**: Quran audio comes only from the reciter files (see Quran task).
`@/components/feature/SoundProvider` → `useSound().play("correct"|"wrong"|"win"|"badge"|"click"|"open")`.
`@/pages/games/components/celebration` → `CelebrationProvider` + `useCelebration().celebrate()` (confetti + phrase). Wrap your page content in `CelebrationProvider` if you call `celebrate()`.
`@/pages/games/components/GameModal` is the shell used by games.
Existing data: `@/mocks/child` (childStories, lettersList, numbersList, surahs, gameList, valueActivities, competitionList…), `@/mocks/home` (values, noorImage, quranSteps, navLinks…). Read them, do not edit them.
`@/data/quran.json` — verified Uthmani text of 12 short surahs: `{ "112": { id, name, en, count, ayahs:[{n, g, t}] } }` where `g` is the global ayah number used for audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${g}.mp3`. Surah ids available: 1, 103, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114.

## Quality bar
Luxury / high-end feel: generous whitespace, perfect alignment, consistent radius, smooth 200–400ms transitions, tasteful micro-animations (stars twinkle, soft bounce on correct, progress bars that fill smoothly), clear hierarchy, big friendly targets. Every state designed: empty, loading, success, error, finished. Keep each page responsive and error-free.
TypeScript strict: no `any`, no unused imports. Verify with: `cd <root>; $env:Path = "C:\Program Files\nodejs;" + $env:Path; npx tsc --noEmit` (fix only the errors in YOUR files; other builders are writing other files at the same time, ignore their errors). **Do NOT run `vite build` or start servers** (the lead does that; concurrent builds collide).

## Final report format
List: files created, files modified (with a 1-line description of each edit), the route(s) you need added to the router and any link text for navigation, store/shared-file changes you want the lead to make, and anything you could not finish.
