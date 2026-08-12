# Interview Moderator Timer

Desktop-first web app for moderators to design user interview studies, manage participants, and run timed slide-based sessions.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- Neon Postgres + Drizzle ORM

## Setup

1. Install dependencies: `npm install`
2. Ensure `.env.local` contains your Neon connection string:

```
DATABASE_URL=postgresql://...
```

3. Run the app: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Flow

1. **Dashboard** — create and open studies
2. **Study builder** — client/study name, session duration, context + warm-up guides, discussion sections
3. **Study detail** — add participants; start a session for a specific person
4. **Live session** — overall timer + per-section timer, slides with prev/next, optional response capture
5. **Session summary** — saved notes and responses
