-- Comunidades: cria, entra, sai. Leitura pública (lista e membros
-- visíveis sem login, igual ao resto do site) — escrita restrita.

create table if not exists public.oldkut_communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  photo_url text,
  creator_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists oldkut_communities_name_idx on public.oldkut_communities(name);

create table if not exists public.oldkut_community_members (
  community_id uuid not null references public.oldkut_communities(id) on delete cascade,
  user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create index if not exists oldkut_community_members_user_idx on public.oldkut_community_members(user_id);

alter table public.oldkut_communities enable row level security;
alter table public.oldkut_community_members enable row level security;

drop policy if exists "oldkut_communities_select_public" on public.oldkut_communities;
create policy "oldkut_communities_select_public" on public.oldkut_communities for select using (true);

drop policy if exists "oldkut_communities_insert_own" on public.oldkut_communities;
create policy "oldkut_communities_insert_own" on public.oldkut_communities for insert with check (auth.uid() = creator_user_id);

drop policy if exists "oldkut_communities_delete_own" on public.oldkut_communities;
create policy "oldkut_communities_delete_own" on public.oldkut_communities for delete using (auth.uid() = creator_user_id);

drop policy if exists "oldkut_community_members_select_public" on public.oldkut_community_members;
create policy "oldkut_community_members_select_public" on public.oldkut_community_members for select using (true);

drop policy if exists "oldkut_community_members_insert_own" on public.oldkut_community_members;
create policy "oldkut_community_members_insert_own" on public.oldkut_community_members for insert with check (auth.uid() = user_id);

drop policy if exists "oldkut_community_members_delete_own" on public.oldkut_community_members;
create policy "oldkut_community_members_delete_own" on public.oldkut_community_members for delete using (auth.uid() = user_id);

grant select on public.oldkut_communities to anon;
grant select, insert, delete on public.oldkut_communities to authenticated;
grant select, insert, delete on public.oldkut_communities to service_role;

grant select on public.oldkut_community_members to anon;
grant select, insert, delete on public.oldkut_community_members to authenticated;
grant select, insert, delete on public.oldkut_community_members to service_role;
