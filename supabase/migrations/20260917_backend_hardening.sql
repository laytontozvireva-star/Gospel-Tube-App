-- Backend hardening migration. Review and run in the Supabase SQL Editor.
-- Restrict storage writes to each authenticated user's own folder.
drop policy if exists "Authenticated users upload media" on storage.objects;
create policy "Users upload their own media" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('videos', 'thumbnails') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users update their own media" on storage.objects
  for update to authenticated
  using (bucket_id in ('videos', 'thumbnails') and owner_id = auth.uid()::text)
  with check (bucket_id in ('videos', 'thumbnails') and owner_id = auth.uid()::text);
create policy "Users delete their own media" on storage.objects
  for delete to authenticated
  using (bucket_id in ('videos', 'thumbnails') and owner_id = auth.uid()::text);

-- Make the SECURITY DEFINER function deterministic and explicitly grant only app roles.
create or replace function public.increment_view_count(video_uuid uuid)
returns void language sql security definer set search_path = public
as $$ update public.videos set views_count = views_count + 1 where id = video_uuid and status = 'published'; $$;
revoke all on function public.increment_view_count(uuid) from public;
grant execute on function public.increment_view_count(uuid) to anon, authenticated;

-- Support the application query patterns efficiently.
create index if not exists watch_history_user_watched_idx on public.watch_history (user_id, watched_at desc);
create index if not exists likes_user_created_idx on public.likes (user_id, created_at desc);
create index if not exists playlist_videos_playlist_position_idx on public.playlist_videos (playlist_id, position);