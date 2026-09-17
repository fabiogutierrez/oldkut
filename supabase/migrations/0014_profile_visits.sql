-- "Quem visitou meu perfil" — a mecânica mais viciante do Orkut
-- original. Cada visita de um usuário logado a um perfil que não é o
-- dele é registrada (no máximo uma por dia por par visitante/perfil,
-- pra não inflar o contador só de dar F5). Só o dono do perfil pode
-- ver o total e a lista de últimos visitantes.

alter table public.oldkut_profiles add column if not exists hide_visits boolean not null default false;

create table if not exists public.oldkut_profile_visits (
  profile_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  visitor_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  visit_day date not null default current_date,
  visited_at timestamptz not null default now(),
  primary key (profile_user_id, visitor_user_id, visit_day)
);

create index if not exists oldkut_profile_visits_profile_idx on public.oldkut_profile_visits(profile_user_id, visited_at desc);

alter table public.oldkut_profile_visits enable row level security;

-- Só o dono do perfil visitado pode ver quem o visitou.
drop policy if exists "oldkut_profile_visits_select_own" on public.oldkut_profile_visits;
create policy "oldkut_profile_visits_select_own" on public.oldkut_profile_visits for select
  using (auth.uid() = profile_user_id);

drop policy if exists "oldkut_profile_visits_insert_own" on public.oldkut_profile_visits;
create policy "oldkut_profile_visits_insert_own" on public.oldkut_profile_visits for insert
  with check (auth.uid() = visitor_user_id and visitor_user_id <> profile_user_id);

drop policy if exists "oldkut_profile_visits_update_own" on public.oldkut_profile_visits;
create policy "oldkut_profile_visits_update_own" on public.oldkut_profile_visits for update
  using (auth.uid() = visitor_user_id)
  with check (auth.uid() = visitor_user_id);

grant select, insert, update on public.oldkut_profile_visits to authenticated;
grant select, insert, update on public.oldkut_profile_visits to service_role;
