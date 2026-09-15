-- Perfil privado: recados e depoimentos só ficam visíveis pro dono e
-- pros amigos aceitos. Protegido no próprio banco (RLS), não só
-- escondido na tela — mesmo alguém batendo direto na API não vê.

alter table public.oldkut_profiles add column if not exists is_private boolean not null default false;

drop policy if exists "oldkut_scraps_select_public" on public.oldkut_scraps;
create policy "oldkut_scraps_select" on public.oldkut_scraps for select
  using (
    exists (
      select 1 from public.oldkut_profiles p
      where p.user_id = oldkut_scraps.profile_user_id
        and (
          p.is_private = false
          or auth.uid() = p.user_id
          or exists (
            select 1 from public.oldkut_friendships f
            where f.status = 'accepted'
              and (
                (f.requester_user_id = p.user_id and f.addressee_user_id = auth.uid())
                or (f.addressee_user_id = p.user_id and f.requester_user_id = auth.uid())
              )
          )
        )
    )
  );

drop policy if exists "oldkut_testimonials_select" on public.oldkut_testimonials;
create policy "oldkut_testimonials_select" on public.oldkut_testimonials for select
  using (
    (status = 'approved' or auth.uid() in (profile_user_id, author_user_id))
    and exists (
      select 1 from public.oldkut_profiles p
      where p.user_id = oldkut_testimonials.profile_user_id
        and (
          p.is_private = false
          or auth.uid() = p.user_id
          or exists (
            select 1 from public.oldkut_friendships f
            where f.status = 'accepted'
              and (
                (f.requester_user_id = p.user_id and f.addressee_user_id = auth.uid())
                or (f.addressee_user_id = p.user_id and f.requester_user_id = auth.uid())
              )
          )
        )
    )
  );
