# Supabase setup (when DB is empty)

## 1. Create all tables

1. Open your **Supabase project** → **SQL Editor**.
2. Click **New query**.
3. Open the file `RUN_THIS_IN_SUPABASE.sql` in this folder and **copy its entire content**.
4. Paste into the SQL Editor and click **Run**.
5. You should see “Success. No rows returned.” Tables are now created.

## 2. Seed users and announcements

From the **backend** directory (where `package.json` is), run:

```bash
npm run seed
```

Make sure `backend/.env` has:

- `SUPABASE_URL` = your project URL (e.g. `https://xxxx.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` = your project’s service role key

After the seed finishes, you can sign in with **your name** (e.g. Азбаяр) on the app; the password is shared and handled by the app.
