# Class Community Backend

REST API backend for a mobile-first class community app with gamification (XP, levels, badges, quests), social features, and admin capabilities.

## Tech Stack

- Node.js + Express.js
- TypeScript
- Supabase (PostgreSQL)
- Cloudinary (image uploads)
- JWT authentication
- bcrypt password hashing

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `NODE_ENV` | development, production, or test |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (bypasses RLS) |
| `JWT_SECRET` | Secret for signing JWTs (min 16 chars) |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name (optional for gallery) |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated |

### 3. Database migrations

Run the SQL migrations in `supabase/migrations/` via the Supabase Dashboard SQL editor or Supabase CLI:

1. `001_initial.sql` - Core tables (users, profiles, posts, comments, reactions, gallery, videos, quests, xp_logs, badges, announcements)
2. `002_notifications.sql` - Notifications tables (for future use)

### 4. Run the server

```bash
npm run dev
```

Server runs at `http://localhost:3001` by default.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user (JWT required)

### Profile
- `GET /api/profile/me` - My profile
- `PUT /api/profile/me` - Update my profile
- `GET /api/profile/me/badges` - My badges

### Students
- `GET /api/students` - List students (search, filter, pagination)
- `GET /api/students/:id` - Get student by profile id

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - List posts (paginated)
- `GET /api/posts/:id` - Get post
- `PUT /api/posts/:id` - Update post (owner/admin)
- `DELETE /api/posts/:id` - Delete post (owner/admin)

### Comments
- `POST /api/posts/:postId/comments` - Add comment
- `GET /api/posts/:postId/comments` - List comments
- `PUT /api/comments/:id` - Update comment (owner/admin)
- `DELETE /api/comments/:id` - Delete comment (owner/admin)

### Reactions
- `POST /api/posts/:postId/reactions` - Add/update reaction
- `DELETE /api/posts/:postId/reactions` - Remove reaction

### Gallery
- `POST /api/gallery/upload` - Upload image (multipart/form-data, field: `image`)
- `GET /api/gallery` - List gallery (category filter, pagination)
- `GET /api/gallery/:id` - Get gallery item
- `DELETE /api/gallery/:id` - Delete (owner/admin)

### Videos (YouTube embeds)
- `POST /api/videos` - Add video (admin)
- `GET /api/videos` - List videos
- `GET /api/videos/:id` - Get video
- `DELETE /api/videos/:id` - Delete (admin)

### Quests
- `GET /api/quests` - List active quests
- `GET /api/quests/me` - My quest progress

### Badges
- `GET /api/badges` - List all badges

### Leaderboard
- `GET /api/leaderboard/all-time` - All-time XP leaderboard
- `GET /api/leaderboard/weekly` - Weekly XP leaderboard

### Announcements
- `GET /api/announcements` - List announcements

### Admin (requires `role: admin`)
- `POST /api/admin/quests` - Create quest
- `PUT /api/admin/quests/:id` - Update quest
- `DELETE /api/admin/quests/:id` - Delete quest
- `POST /api/admin/badges` - Create badge
- `POST /api/admin/users/:id/badges` - Award badge to user
- `POST /api/admin/announcements` - Create announcement
- `PUT /api/admin/announcements/:id` - Update announcement
- `DELETE /api/admin/announcements/:id` - Delete announcement
- `PUT /api/admin/posts/:id/hide` - Hide/flag post
- `DELETE /api/admin/posts/:id` - Delete post
- `DELETE /api/admin/comments/:id` - Delete comment
- `DELETE /api/admin/gallery/:id` - Delete gallery item
- `GET /api/admin/users` - List users
- `POST /api/admin/xp/adjust` - Adjust user XP (body: `{ userId, amount, reason? }`)

## Authentication

Include the JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

## Project structure

```
backend/
├── src/
│   ├── config/       # env, constants
│   ├── db/           # Supabase client
│   ├── middleware/   # auth, validation, error handling
│   ├── routes/       # route definitions
│   ├── controllers/  # request handlers
│   ├── services/     # business logic
│   ├── validators/   # Zod schemas
│   ├── utils/        # helpers (level, YouTube)
│   ├── types/        # TypeScript types
│   ├── app.ts
│   └── index.ts
├── supabase/
│   └── migrations/   # SQL migrations
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```
