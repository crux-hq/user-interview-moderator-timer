# Design System — Interview Moderator Timer

## Product Context
- **What this is:** A desktop-first web app for running timed user interviews. Moderators write a script, add people, then tick off questions while watching section time against the whole session.
- **Who it's for:** UX interview moderators. They are often on a video call at the same time.
- **Space/industry:** User research / interview ops. Peers include Lookback, Dovetail, UserTesting, Maze.
- **Project type:** Web app with a small public marketing landing page.

## Aesthetic Direction
- **Direction:** Industrial / utilitarian
- **Decoration level:** minimal
- **Mood:** Dead simple, no fluff. A working instrument. Get out of the way while someone is talking.
- **Memorable thing:** Dead simple, no fluff.
- **Reference sites:** None. Competitive research was skipped by choice.

## Typography
- **Display/Hero:** IBM Plex Sans — one product face from landing H1 to form labels. Built for software UI. Replaces Inter.
- **Body:** IBM Plex Sans
- **UI/Labels:** IBM Plex Sans, 12px, medium, muted color
- **Data/Tables:** JetBrains Mono with `tabular-nums` — Overall and This section timers, durations
- **Code:** JetBrains Mono
- **Loading:** Bunny Fonts (or equivalent) for `ibm-plex-sans` 400/500/600/700 and `jetbrains-mono` 500/600. Do not load Inter.
- **Scale:**
  - Label / meta: 12px
  - App body / UI: 14px
  - Landing body: 16px
  - Section title: 18px
  - Page title: 28–32px
  - Landing hero: 36px
  - Timer digits: 22–28px mono

## Color
- **Approach:** restrained
- **Primary:** `#1C1917` — ink. Buttons, headings, key UI. Not a brand hue.
- **Secondary:** none. Do not invent a purple, blue, or teal brand color.
- **Neutrals:** paper `#F5F5F4`, elevated `#FFFFFF`, line `#E7E5E4`, muted `#737373`, ink `#1C1917`
- **Semantic:** success / covered `#059669`, warning / section time `#D97706`, error / overtime `#DC2626`, info = muted ink
- **Dark mode:** surfaces invert to stone (`#1C1917` bg, `#292524` elevated, `#F5F5F4` ink). Keep semantic hues, slightly brighter (warn `#FBBF24`, danger `#F87171`, ok `#34D399`). Reduce saturation vs light mode. Default remains light. Moderators sit on video calls.

## Spacing
- **Base unit:** 8px
- **Density:** compact in the app (study editor, live session). Comfortable on the public landing.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** grid-disciplined. Hybrid only in the sense that the landing has more air than the app.
- **Grid:** one column on small screens. App content max two columns for related fields.
- **Max content width:** 64rem (app), 42rem (landing hero copy)
- **Border radius:** sm 4px, md 6px, lg 8px, cards 10px, full 9999px (timer is not a pill; checkmarks are circles)

## Motion
- **Approach:** minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50–100ms) short(150–250ms). No bouncing timers. Check-off is instant. No scroll-driven motion. No gradient button hover.

## Do not
- Inter, Roboto, Poppins, Space Grotesk, or system-ui as the primary face
- Purple/violet gradients, gradient CTAs, icon-in-colored-circle feature grids
- A second display font
- Brand color besides ink, plus the three semantic colors above

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-12 | Initial design system | /design-consultation. Product: UX moderator timer. Memorable thing: dead simple, no fluff. Research skipped. Industrial + IBM Plex Sans + JetBrains Mono + restrained ink-on-paper. Compact live session. No brand accent. Preview approved via HTML specimen (OpenAI mockups unavailable). |
| 2026-08-12 | Agent defaults kept | Dark mode stone inversion, 8px spacing scale, 14px app body, 150ms chrome fades. Not separately drilled. |
