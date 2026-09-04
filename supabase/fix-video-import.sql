-- Run this once in Supabase SQL Editor to make CSV video imports tolerant
-- of an empty or NULL tags field.

alter table public.videos
  alter column tags set default '{}';

create or replace function public.normalize_video_tags()
returns trigger
language plpgsql
as $$
begin
  new.tags := coalesce(new.tags, '{}');
  return new;
end;
$$;

drop trigger if exists normalize_video_tags_before_write on public.videos;
create trigger normalize_video_tags_before_write
before insert or update on public.videos
for each row execute function public.normalize_video_tags();
