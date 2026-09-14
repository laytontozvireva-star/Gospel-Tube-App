-- RPC function to atomically increment a video's view count.
create or replace function public.increment_view_count(video_uuid uuid)
returns void
language sql
security definer
as $$
  update public.videos
  set views_count = views_count + 1
  where id = video_uuid;
$$;
