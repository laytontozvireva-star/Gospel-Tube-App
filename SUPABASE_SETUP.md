# Supabase setup

1. Create a Supabase project.
2. In **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
4. Restart `npm start` after changing environment variables.

The app supports a local demo mode when the environment variables are missing. Once configured, authentication uses Supabase Auth and the database/storage policies in the schema protect user-owned content.

The schema creates:

- profiles and apostles
- videos with draft/published/archived status
- playlists and playlist membership
- likes and watch history
- per-user notifications
- public `videos` and `thumbnails` storage buckets
