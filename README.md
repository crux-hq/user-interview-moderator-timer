# Interview Moderator Timer

Desktop-first web app for moderators to design user interview studies, manage participants, and run timed slide-based sessions.

Hosted app: [user-interview-moderator-timer.vercel.app](https://user-interview-moderator-timer.vercel.app)

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- Neon Postgres + Drizzle ORM
- Better Auth (email + password, hashed in your database)

## Use the hosted app

1. Open the Vercel URL
2. Create an account with email and password
3. Your studies stay private to that account

## Fork and run your own

1. Fork [this repository](https://github.com/crux-hq/user-interview-moderator-timer)
2. Create a [Neon](https://neon.tech) project and copy the connection string
3. Clone your fork, then:

```bash
npm install
cp .env.example .env.local
```

4. Fill in `.env.local`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Apply the schema to Neon:

```bash
psql "$DATABASE_URL" -f drizzle/init.sql
```
6. `npm run dev` and open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Import the forked GitHub repo in Vercel
2. Set environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`)
3. Deploy

## Flow

1. **Sign in / create account**
2. **Dashboard** — create and open studies
3. **Study builder** — client/study name, session duration, context + warm-up guides, nested sections and questions (sections can be collapsed while editing)
4. **Study detail** — add participants; start a session for a specific person
5. **Live session** — overall timer + per-section timer, check off questions as you cover them
6. **Session summary** — saved notes, responses, and coverage
