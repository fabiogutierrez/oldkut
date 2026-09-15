-- Fecha a mesma lacuna de perfil privado pra lista de comunidades:
-- até agora, a visibilidade de "fulano é membro da comunidade X" só
-- dependia da privacidade da COMUNIDADE, nunca da privacidade do
-- PERFIL do membro. Um perfil marcado como privado podia mesmo assim
-- aparecer na lista pública de membros de uma comunidade pública.
--
-- Trade-off aceito: membros com perfil privado deixam de aparecer na
-- lista pública de membros de uma comunidade pública (pra quem não é
-- amigo deles, nem o criador da comunidade). Continuam aparecendo pra
-- si mesmos, pros amigos aceitos, pro criador da comunidade, e pros
-- outros membros quando a comunidade em si já é privada (aí todo mundo
-- ali já está no mesmo espaço fechado).

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
        and (
          auth.uid() = oldkut_community_members.user_id
          or auth.uid() = c.creator_user_id
          or not exists (
            select 1 from public.oldkut_profiles p
            where p.user_id = oldkut_community_members.user_id and p.is_private = true
          )
          or public.oldkut_is_accepted_friend(oldkut_community_members.user_id, auth.uid())
          or (c.is_private = true and public.oldkut_is_community_member(c.id, auth.uid()))
        )
    )
  );
