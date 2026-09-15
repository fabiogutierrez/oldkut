-- oldkut: perfil + mural de recados (scraps). Leitura pública (perfil e
-- recados são visíveis sem login, como no Orkut original) — escrita
-- restrita ao dono/autor.

create table if not exists public.oldkut_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  photo_url text,
  bio text,
  city text,
  birthday date,
  created_at timestamptz not null default now()
);

create index if not exists oldkut_profiles_username_idx on public.oldkut_profiles(username);

create table if not exists public.oldkut_scraps (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  author_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists oldkut_scraps_profile_idx on public.oldkut_scraps(profile_user_id, created_at desc);

alter table public.oldkut_profiles enable row level security;
alter table public.oldkut_scraps enable row level security;

drop policy if exists "oldkut_profiles_select_public" on public.oldkut_profiles;
create policy "oldkut_profiles_select_public" on public.oldkut_profiles for select using (true);

drop policy if exists "oldkut_profiles_insert_own" on public.oldkut_profiles;
create policy "oldkut_profiles_insert_own" on public.oldkut_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "oldkut_profiles_update_own" on public.oldkut_profiles;
create policy "oldkut_profiles_update_own" on public.oldkut_profiles for update using (auth.uid() = user_id);

drop policy if exists "oldkut_scraps_select_public" on public.oldkut_scraps;
create policy "oldkut_scraps_select_public" on public.oldkut_scraps for select using (true);

drop policy if exists "oldkut_scraps_insert_own_author" on public.oldkut_scraps;
create policy "oldkut_scraps_insert_own_author" on public.oldkut_scraps for insert with check (auth.uid() = author_user_id);

drop policy if exists "oldkut_scraps_delete_own" on public.oldkut_scraps;
create policy "oldkut_scraps_delete_own" on public.oldkut_scraps for delete using (auth.uid() = profile_user_id or auth.uid() = author_user_id);

grant select on public.oldkut_profiles to anon;
grant select, insert, update on public.oldkut_profiles to authenticated;
grant select, insert, update on public.oldkut_profiles to service_role;

grant select on public.oldkut_scraps to anon;
grant select, insert, delete on public.oldkut_scraps to authenticated;
grant select, insert, delete on public.oldkut_scraps to service_role;
