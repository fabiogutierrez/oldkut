-- Comunidade privada (só membros veem publicações e lista de membros)
-- + mural de publicações dentro da comunidade.

alter table public.oldkut_communities add column if not exists is_private boolean not null default false;

create table if not exists public.oldkut_community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.oldkut_communities(id) on delete cascade,
  author_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists oldkut_community_posts_community_idx on public.oldkut_community_posts(community_id, created_at desc);

alter table public.oldkut_community_posts enable row level security;

-- Membros: se a comunidade é privada, só aparece pra quem já é membro
-- (ou o criador). Reaproveitado tanto pra publicações quanto pra ver
-- a lista de membros.

drop policy if exists "oldkut_community_members_select_public" on public.oldkut_community_members;
create policy "oldkut_community_members_select" on public.oldkut_community_members for select
  using (
    exists (
      select 1 from public.oldkut_communities c
      where c.id = oldkut_community_members.community_id
        and (
          c.is_private = false
          or auth.uid() = c.creator_user_id
          or exists (
            select 1 from public.oldkut_community_members m2
            where m2.community_id = c.id and m2.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "oldkut_community_posts_select" on public.oldkut_community_posts;
create policy "oldkut_community_posts_select" on public.oldkut_community_posts for select
  using (
    exists (
      select 1 from public.oldkut_communities c
      where c.id = oldkut_community_posts.community_id
        and (
          c.is_private = false
          or auth.uid() = c.creator_user_id
          or exists (
            select 1 from public.oldkut_community_members m2
            where m2.community_id = c.id and m2.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "oldkut_community_posts_insert_member" on public.oldkut_community_posts;
create policy "oldkut_community_posts_insert_member" on public.oldkut_community_posts for insert
  with check (
    auth.uid() = author_user_id
    and exists (
      select 1 from public.oldkut_community_members m
      where m.community_id = oldkut_community_posts.community_id and m.user_id = auth.uid()
    )
  );

drop policy if exists "oldkut_community_posts_delete_own" on public.oldkut_community_posts;
create policy "oldkut_community_posts_delete_own" on public.oldkut_community_posts for delete
  using (
    auth.uid() = author_user_id
    or auth.uid() in (select creator_user_id from public.oldkut_communities c where c.id = oldkut_community_posts.community_id)
  );

grant select on public.oldkut_community_posts to anon;
grant select, insert, delete on public.oldkut_community_posts to authenticated;
grant select, insert, delete on public.oldkut_community_posts to service_role;
