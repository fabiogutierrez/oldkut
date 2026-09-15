-- Curtidas e respostas nas publicações do mural da comunidade.

create table if not exists public.oldkut_community_post_likes (
  post_id uuid not null references public.oldkut_community_posts(id) on delete cascade,
  user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists oldkut_community_post_likes_post_idx on public.oldkut_community_post_likes(post_id);

create table if not exists public.oldkut_community_post_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.oldkut_community_posts(id) on delete cascade,
  author_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists oldkut_community_post_replies_post_idx on public.oldkut_community_post_replies(post_id, created_at);

alter table public.oldkut_community_post_likes enable row level security;
alter table public.oldkut_community_post_replies enable row level security;

-- Curtidas: visibilidade segue a mesma regra de privacidade da comunidade
-- (usa a função oldkut_is_community_member criada na migration 0010 pra
-- não cair em recursão de novo).

drop policy if exists "oldkut_community_post_likes_select" on public.oldkut_community_post_likes;
create policy "oldkut_community_post_likes_select" on public.oldkut_community_post_likes for select
  using (
    exists (
      select 1
      from public.oldkut_community_posts p
      join public.oldkut_communities c on c.id = p.community_id
      where p.id = oldkut_community_post_likes.post_id
        and (
          c.is_private = false
          or auth.uid() = c.creator_user_id
          or public.oldkut_is_community_member(c.id, auth.uid())
        )
    )
  );

drop policy if exists "oldkut_community_post_likes_insert_own" on public.oldkut_community_post_likes;
create policy "oldkut_community_post_likes_insert_own" on public.oldkut_community_post_likes for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.oldkut_community_posts p
      where p.id = oldkut_community_post_likes.post_id
        and public.oldkut_is_community_member(p.community_id, auth.uid())
    )
  );

drop policy if exists "oldkut_community_post_likes_delete_own" on public.oldkut_community_post_likes;
create policy "oldkut_community_post_likes_delete_own" on public.oldkut_community_post_likes for delete
  using (auth.uid() = user_id);

grant select on public.oldkut_community_post_likes to anon;
grant select, insert, delete on public.oldkut_community_post_likes to authenticated;
grant select, insert, delete on public.oldkut_community_post_likes to service_role;

-- Respostas: mesma visibilidade; só membro pode responder; autor ou
-- criador da comunidade podem excluir.

drop policy if exists "oldkut_community_post_replies_select" on public.oldkut_community_post_replies;
create policy "oldkut_community_post_replies_select" on public.oldkut_community_post_replies for select
  using (
    exists (
      select 1
      from public.oldkut_community_posts p
      join public.oldkut_communities c on c.id = p.community_id
      where p.id = oldkut_community_post_replies.post_id
        and (
          c.is_private = false
          or auth.uid() = c.creator_user_id
          or public.oldkut_is_community_member(c.id, auth.uid())
        )
    )
  );

drop policy if exists "oldkut_community_post_replies_insert_member" on public.oldkut_community_post_replies;
create policy "oldkut_community_post_replies_insert_member" on public.oldkut_community_post_replies for insert
  with check (
    auth.uid() = author_user_id
    and exists (
      select 1 from public.oldkut_community_posts p
      where p.id = oldkut_community_post_replies.post_id
        and public.oldkut_is_community_member(p.community_id, auth.uid())
    )
  );

drop policy if exists "oldkut_community_post_replies_delete_own" on public.oldkut_community_post_replies;
create policy "oldkut_community_post_replies_delete_own" on public.oldkut_community_post_replies for delete
  using (
    auth.uid() = author_user_id
    or auth.uid() in (
      select c.creator_user_id
      from public.oldkut_community_posts p
      join public.oldkut_communities c on c.id = p.community_id
      where p.id = oldkut_community_post_replies.post_id
    )
  );

grant select on public.oldkut_community_post_replies to anon;
grant select, insert, delete on public.oldkut_community_post_replies to authenticated;
grant select, insert, delete on public.oldkut_community_post_replies to service_role;
