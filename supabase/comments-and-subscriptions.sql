-- Migration: Add comments and subscriptions tables

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) >= 1),
  created_at timestamptz not null default now()
);

create index comments_video_created_idx on public.comments (video_id, created_at desc);

alter table public.comments enable row level security;

create policy "Public can read comments" on public.comments
  for select using (true);

create policy "Users can add comments" on public.comments
  for insert with check (user_id = auth.uid());

create policy "Users can delete own comments" on public.comments
  for delete using (user_id = auth.uid());

create table public.subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  apostle_id uuid not null references public.apostles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, apostle_id)
);

alter table public.subscriptions enable row level security;

create policy "Public can read subscriptions" on public.subscriptions
  for select using (true);

create policy "Users manage their subscriptions" on public.subscriptions
  for insert with check (user_id = auth.uid());

create policy "Users can unsubscribe" on public.subscriptions
  for delete using (user_id = auth.uid());
