# AI-POST-CREATOR — Agent Instructions

## Project Overview

AI-powered social media post creator. Users fill in a form (topic, platform, size, style, hashtags toggle, extras), the backend generates post text via OpenRouter and an AI image via Freepik Mystic, then saves the result to PostgreSQL. Posts are viewable in a history on the profile page.

## Monorepo Structure

```
AI-POST-CREATOR/
├── frontend/          # Next.js 16 app (App Router)
├── backend/           # Fastify 5 API server
└── agents.md          # this file
```

---

## Frontend (`/frontend`)

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, MUI v7 (Material UI + Emotion), Zustand v5, react-hook-form, i18next + react-i18next, axios, react-hot-toast

**Key conventions:**
- Use App Router (`app/` directory)
- Most pages are Client Components (`"use client"`) — the app is interactive-first
- File naming: `PascalCase` for components, `camelCase` for utils/hooks
- Components: PascalCase, one component per file
- Use `next/image` for all images, `next/link` for navigation
- UI primitives live in `src/ui/` (`Button.tsx`, `TextField.tsx`)
- API calls go in `src/api/<resource>/<resource>.ts`
- Global state in `src/store/` via Zustand (`useUserStore`, `usePostsStore`)
- Translations in `src/i18n/resources.ts`; supported languages: `en`, `uk`; stored in `localStorage` under `lang`
- Toast notifications via `react-hot-toast` through `src/utils/alert.ts`
- HTTP via axios instance in `src/utils/axios.ts`

**Dev commands:**
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000  (next dev --webpack)
npm run build      # next build --webpack
npm run lint
```

**Environment variables:** `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Backend (`/backend`)

**Stack:** Node.js, Fastify 5, TypeScript, Prisma 6, PostgreSQL, OpenRouter SDK, Freepik Mystic API, JWT, bcrypt, Google OAuth2 (`@fastify/oauth2`), Zod + zod-to-json-schema, Swagger

**Module structure** — each feature is a folder under `src/modules/<feature>/`:
```
src/modules/<feature>/
  <feature>.controller.ts   ← Fastify route handlers
  <feature>.route.ts        ← Fastify plugin, registers routes with prefix
  <feature>.schema.ts       ← Zod schemas + TypeScript types
  <feature>.service.ts      ← business logic + Prisma queries
```

**Existing modules:**
- `auth` — register, login, Google OAuth2 callback → prefix `/api/auth`
- `user` — get/update user profile → prefix `/api/user`
- `post` — create (AI-generated), list, get by id, update, delete → prefix `/api/posts`

**Key conventions:**
- Schemas defined with **Zod**, converted to JSON Schema for Fastify validation
- Services call Prisma directly — no separate repository layer
- Auth: JWT issued on login/register, verified via `src/utils/jwt.ts`; cookies via `@fastify/cookie`
- Fastify built-in `logger: true` — no `console.log` in new code
- All env vars accessed via Prisma's `env()` helper or `process.env`

**AI pipeline (post creation):**
1. OpenRouter (`arcee-ai/trinity-large-preview:free`) generates JSON with `postTitle`, `postText`, `imageText`, `postTags`
2. Raw response repaired with `jsonrepair` and parsed via `src/utils/json-helpers.ts`
3. Freepik Mystic API generates image from `imageText` (async polling until `COMPLETED`)
4. Result saved to `posts` table via Prisma

**Dev commands:**
```bash
cd backend
npm install
npm run dev        # http://localhost:5000  (tsx watch)
npm run start      # production
```

**Swagger docs:** `http://localhost:5000/docs`

**Environment variables:** `.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_creator
AI_GATEWAY_API_KEY=          # OpenRouter API key
FREEPIK_API_KEY=             # Freepik Mystic API key
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

**API routes:**
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| GET | `/api/auth/google` | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/user` | Get current user |
| PATCH | `/api/user` | Update current user |
| POST | `/api/posts` | Generate AI post |
| GET | `/api/posts` | List user's posts |
| GET | `/api/posts/:id` | Get post by id |
| PATCH | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

---

## Database (Prisma)

**Schema** (`backend/prisma/schema.prisma`):
```
User   { id, email, name?, password?, googleId?, posts[] }
Post   { id, createAt, updateAt, image, title, text, tags?, platform, creatorId }
```

**Migrations:**
```bash
cd backend
npx prisma migrate dev --name <name>
npx prisma generate          # regenerate client after schema changes
```

Generated client output: `backend/src/generated/prisma/`

---

## TypeScript

- `strict: true` in both `tsconfig.json` files
- No `any` — use `unknown` and narrow with type guards
- Zod is the source of truth for request/response types in the backend; infer types from schemas

---

## Code Style

- **Formatter:** Prettier (default config)
- **Linter:** ESLint with TypeScript + Next.js rules
- **Imports:** use `@/` alias for frontend `src/` imports
- **Async:** always `async/await`, never raw `.then()` chains
- No `console.log` in committed code — use Fastify's logger in backend

---

## AI Agent Guidelines

When making changes:
1. **Read existing code first** before generating new files — match the patterns already in place
2. **Never overwrite** `.env`, `.env.local`, or migration files without explicit instruction
3. **Module pattern is mandatory** — new backend features go in `src/modules/<feature>/` with controller, route, schema, and service files
4. **Zod for all schemas** — define Zod schema first, derive TypeScript types from it, convert to JSON Schema for Fastify
5. **Prisma directly in services** — no separate repository layer
6. When adding a new API endpoint: create the module folder, register the route plugin in `src/server.ts` with the correct prefix
7. When adding a new page: create it under `frontend/src/app/`, add `"use client"` if the page needs interactivity or hooks

---

## Common Tasks

**Add a new API module (backend):**
```
backend/src/modules/<feature>/<feature>.schema.ts     ← Zod schemas + types
backend/src/modules/<feature>/<feature>.service.ts    ← business logic + Prisma
backend/src/modules/<feature>/<feature>.controller.ts ← Fastify handlers
backend/src/modules/<feature>/<feature>.route.ts      ← Fastify plugin
```
Then register in `backend/src/server.ts`:
```ts
fastify.register(featureRoutes, { prefix: "/api/<feature>" });
```

**Add a new page (frontend):**
```
frontend/src/app/<page>/page.tsx          ← add "use client" if interactive
frontend/src/app/<page>/components/       ← sub-components if needed
```

**Add a translation key:**
Add to both `en` and `uk` objects in `frontend/src/i18n/resources.ts`, then use via `const { t } = useTranslation()`.
