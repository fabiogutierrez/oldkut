-- Depoimentos: diferente do recado (scrap), só aparece publicamente
-- depois que o dono do perfil aprova. O autor consegue ver o próprio
-- depoimento mesmo pendente (pra saber que está aguardando aprovação).

create table if not exists public.oldkut_testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  author_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  constraint oldkut_testimonials_no_self check (profile_user_id <> author_user_id)
);

create index if not exists oldkut_testimonials_profile_idx on public.oldkut_testimonials(profile_user_id, status, created_at desc);

alter table public.oldkut_testimonials enable row level security;

drop policy if exists "oldkut_testimonials_select" on public.oldkut_testimonials;
create policy "oldkut_testimonials_select" on public.oldkut_testimonials for select
  using (status = 'approved' or auth.uid() in (profile_user_id, author_user_id));

drop policy if exists "oldkut_testimonials_insert_own" on public.oldkut_testimonials;
create policy "oldkut_testimonials_insert_own" on public.oldkut_testimonials for insert
  with check (auth.uid() = author_user_id);

drop policy if exists "oldkut_testimonials_update_owner" on public.oldkut_testimonials;
create policy "oldkut_testimonials_update_owner" on public.oldkut_testimonials for update
  using (auth.uid() = profile_user_id and status = 'pending')
  with check (status = 'approved');

drop policy if exists "oldkut_testimonials_delete_own" on public.oldkut_testimonials;
create policy "oldkut_testimonials_delete_own" on public.oldkut_testimonials for delete
  using (auth.uid() in (profile_user_id, author_user_id));

grant select on public.oldkut_testimonials to anon;
grant select, insert, update, delete on public.oldkut_testimonials to authenticated;
grant select, insert, update, delete on public.oldkut_testimonials to service_role;
