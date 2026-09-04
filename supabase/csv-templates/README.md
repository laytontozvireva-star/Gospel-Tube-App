# CSV import templates

Import these files from Supabase Table Editor after running `schema.sql`.

Replace `<AUTH_USER_UUID>` with the real UUID from **Authentication → Users** before importing user-owned tables. Replace `<VIDEO_UUID>` and `<PLAYLIST_UUID>` with IDs generated after importing videos and playlists.

Import order:

1. `apostles.csv`
2. `profiles.csv` and `videos.csv`
3. `playlists.csv`
4. `playlist_videos.csv`
5. `likes.csv`, `watch_history.csv`, and `notifications.csv`
