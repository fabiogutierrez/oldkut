-- A policy de select de oldkut_community_members criada na migration 0009
-- consultava a própria oldkut_community_members dentro do seu USING,
-- o que causa "infinite recursion detected in policy" no Postgres.
--
-- Corrige criando uma função security definer (que não passa pelas
-- policies de novo) para checar se o usuário é membro de uma comunidade,
-- e reaproveita essa função nas policies que precisam disso.

create or replace function public.oldkut_is_community_member(p_community_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.oldkut_community_members m
    where m.community_id = p_community_id
      and m.user_id = p_user_id
  );
$$;

grant execute on function public.oldkut_is_community_member(uuid, uuid) to anon, authenticated;

drop policy if exists "oldkut_community_members_select" on public.oldkut_community_members;
create policy "oldkut_community_members_select" on public.oldkut_community_members for select
  using (
    exists (
      select 1 from public.oldkut_communities c
      where c.id = oldkut_community_members.community_id
        and (
          c.is_private = false
          or auth.uid() = c.creator_user_id
          or public.oldkut_is_community_member(c.id, auth.uid())
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
          or public.oldkut_is_community_member(c.id, auth.uid())
        )
    )
  );

drop policy if exists "oldkut_community_posts_insert_member" on public.oldkut_community_posts;
create policy "oldkut_community_posts_insert_member" on public.oldkut_community_posts for insert
  with check (
    auth.uid() = author_user_id
    and public.oldkut_is_community_member(community_id, auth.uid())
  );
