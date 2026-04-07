create extension if not exists "pgcrypto";

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_path text not null unique,
  created_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id) on delete set null
);

alter table public.photos enable row level security;

create policy "Public can read photos"
on public.photos
for select
to public
using (true);

create policy "Owner can insert photos"
on public.photos
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com');

create policy "Owner can delete photos"
on public.photos
for delete
to authenticated
using ((select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com');

insert into storage.buckets (id, name, public)
values ('photo-collection', 'photo-collection', true)
on conflict (id) do nothing;

create policy "Public can view photo files"
on storage.objects
for select
to public
using (bucket_id = 'photo-collection');

create policy "Owner can upload photo files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'photo-collection'
  and (select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com'
);

create policy "Owner can delete photo files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'photo-collection'
  and (select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com'
);

create table if not exists public.heroes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  description text not null,
  image_path text not null unique,
  created_at timestamptz not null default now(),
  uploaded_by uuid references auth.users (id) on delete set null
);

alter table public.heroes enable row level security;

create policy "Public can read heroes"
on public.heroes
for select
to public
using (true);

create policy "Owner can insert heroes"
on public.heroes
for insert
to authenticated
with check ((select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com');

create policy "Owner can delete heroes"
on public.heroes
for delete
to authenticated
using ((select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com');

insert into storage.buckets (id, name, public)
values ('hero-collection', 'hero-collection', true)
on conflict (id) do nothing;

create policy "Public can view hero files"
on storage.objects
for select
to public
using (bucket_id = 'hero-collection');

create policy "Owner can upload hero files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'hero-collection'
  and (select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com'
);

create policy "Owner can delete hero files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'hero-collection'
  and (select auth.jwt() ->> 'email') = 'sonumurmu077@gmail.com'
);
