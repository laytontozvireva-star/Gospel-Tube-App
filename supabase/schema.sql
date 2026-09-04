-- GospelTube database schema. Run this in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create type public.video_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.apostles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  avatar_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  apostle_id uuid references public.apostles(id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  description text not null default '',
  category text not null default 'Sermon',
  tags text[] not null default '{}',
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  status public.video_status not null default 'draft',
  views_count bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.playlist_videos (
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  position integer not null default 0,
  primary key (playlist_id, video_id)
);

create table public.likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  progress_seconds integer not null default 0,
  watched_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index videos_status_created_idx on public.videos(status, created_at desc);
create index videos_category_idx on public.videos(category);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.apostles enable row level security;
alter table public.videos enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_videos enable row level security;
alter table public.likes enable row level security;
alter table public.watch_history enable row level security;
alter table public.notifications enable row level security;

create policy "Public can read apostles" on public.apostles for select using (true);
create policy "Public can read published videos" on public.videos for select using (status = 'published' or owner_id = auth.uid());
create policy "Users can create their own videos" on public.videos for insert with check (owner_id = auth.uid());
create policy "Owners can update their videos" on public.videos for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Users manage their profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "Users manage their playlists" on public.playlists for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Public can read public playlists" on public.playlists for select using (is_public = true or owner_id = auth.uid());
create policy "Users manage playlist videos" on public.playlist_videos for all using (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid())) with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.owner_id = auth.uid()));
create policy "Users manage their likes" on public.likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their history" on public.watch_history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users read their notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update their notifications" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public) values ('videos', 'videos', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true) on conflict (id) do nothing;

create policy "Public can read media" on storage.objects for select using (bucket_id in ('videos', 'thumbnails'));
create policy "Authenticated users upload media" on storage.objects for insert to authenticated with check (bucket_id in ('videos', 'thumbnails'));
