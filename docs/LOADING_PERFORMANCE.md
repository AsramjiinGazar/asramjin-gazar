# Loading performance refactor – summary

## Route classification

| Route | Type | Strategy |
|-------|------|----------|
| `/login`, `/register` | Public static | No data fetch until submit; no change. |
| `/` (Home) | Hybrid | Personalized (profile from auth) + shared (announcements, leaderboard top3, quests). Shell from auth; sections use client cache + skeleton when no data. |
| `/students` | Personalized (auth) | Shared list (same for all). Client cache + skeleton on first load. |
| `/gallery` | Personalized (auth) | Shared per category. Client cache + skeleton on first load. |
| `/leaderboard` | Shared | Same data for all users. Client cache + skeleton on first load. |
| `/quest` | Hybrid | Shared quests list + personalized progress. Client cache + skeleton when no quests. |
| `/profile` | Personalized | Current user only. Skeleton when auth profile not yet loaded. |
| `/calendar` | Personalized | Local state (events in memory). No server list; no change. |
| `/admin` | Public (no auth) | Forms; mutations. No list caching; no change. |

---

## 1. ISR (Incremental Static Regeneration)

**Not used.** This is a **Vite + React SPA**, not Next.js. There is no server-side rendering or ISR. “Public mostly-static” content is handled by **client-side caching** with longer `staleTime` (see below).

---

## 2. Client cache + background refetch

- **QueryClient** (`src/lib/queryClient.ts`): Default `staleTime: 2 min`, `gcTime: 5 min`, `refetchOnWindowFocus: true`. Data stays on screen while refetching.
- **Shared data** (2 min stale): `announcements`, `leaderboard` (all-time and monthly), `quests` list, `students` list, `gallery` list.
- **Personalized data** (1 min stale): `quests/me` (my progress), `profile/badges`.
- **Prefetch** (`PrefetchOnAuth`): When the user is authenticated, we prefetch `announcements`, `leaderboard` (top 3), and `quests` so Home can show data immediately or from cache.

Skeletons are shown **only when there is no data yet** (initial load). If cached data exists, it is shown and refetched in the background without a loading state.

---

## 3. Skeletons added

| Location | Component | When shown |
|----------|-----------|------------|
| Protected route (auth check) | `AppShellSkeleton` | While resolving token / profile (replaces full-page “Уншиж байна…” text). |
| Home | `HomeSkeleton` | When profile is not yet available. |
| Home | Inline section skeletons | Top 3 leaderboard and announcements sections when their query is pending and they have no data. |
| Leaderboard | `LeaderboardSkeleton` | When leaderboard query is pending and list is empty. |
| Students | `StudentsSkeleton` | When students list is pending and empty (and not viewing a student detail). |
| Quest | `QuestSkeleton` | When quests list is pending and empty. |
| Gallery | `GallerySkeleton` | When gallery list is pending and empty. |
| Profile | `ProfileSkeleton` | When profile (from auth) is not yet available. |

No full-page spinners were added; existing centered “Loading…” text was replaced by these skeletons or removed.

---

## 4. SSR / streaming

**Not used.** The stack is **Vite + React client-only**. There is no SSR or streaming. The “initial shell” is the client-rendered app after JS loads; we improved perceived performance by:

- Showing an **app-shell skeleton** during auth check instead of a blank or text-only screen.
- Using **prefetch** and **stale-while-revalidate** so that once the user is logged in, Home and other pages can render from cache immediately when possible.

To get true SSR or streaming, the app would need to be migrated to a framework that supports it (e.g. Next.js, Remix).

---

## Files touched

- `src/lib/queryClient.ts` – new; default options and stale times.
- `src/components/skeletons/*` – new; AppShell, Home, Leaderboard, Students, Quest, Gallery, Profile.
- `src/components/PrefetchOnAuth.tsx` – new; prefetch on auth.
- `src/App.tsx` – use `createQueryClient()`, mount `PrefetchOnAuth`.
- `src/components/ProtectedRoute.tsx` – use `AppShellSkeleton` instead of text.
- `src/pages/Home.tsx` – skeletons, shared staleTime, section placeholders.
- `src/pages/Leaderboard.tsx` – `LeaderboardSkeleton`, shared staleTime.
- `src/pages/Students.tsx` – `StudentsSkeleton`, shared staleTime.
- `src/pages/Quest.tsx` – `QuestSkeleton`, shared + personalized staleTime.
- `src/pages/Gallery.tsx` – `GallerySkeleton`, shared staleTime.
- `src/pages/Profile.tsx` – `ProfileSkeleton`, personalized staleTime for badges.
