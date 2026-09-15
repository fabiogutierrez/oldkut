-- Fecha a lacuna de segurança da lista de amigos: até agora, perfil
-- privado só escondia a lista de amigos na tela (UI) — batendo direto
-- na API/REST do Supabase ainda dava pra ler as amizades aceitas de
-- qualquer perfil. Agora a proteção é no próprio banco (RLS), igual já
-- é feito pra recados e depoimentos desde a migration 0008.
--
-- Uma amizade (A, B) só fica visível pra quem não é A nem B se os DOIS
-- lados permitirem: cada lado precisa estar com o perfil público, ou o
-- viewer precisa já ser amigo aceito daquele lado especificamente.
-- É proposital ser conservador aqui: se qualquer um dos dois for
-- privado (e o viewer não for amigo dele), a amizade fica escondida —
-- inclusive na página do lado que é público.

create or replace function public.oldkut_is_accepted_friend(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.oldkut_friendships f
    where f.status = 'accepted'
      and (
        (f.requester_user_id = p_user_a and f.addressee_user_id = p_user_b)
        or (f.requester_user_id = p_user_b and f.addressee_user_id = p_user_a)
      )
  );
$$;

grant execute on function public.oldkut_is_accepted_friend(uuid, uuid) to anon, authenticated;

drop policy if exists "oldkut_friendships_select" on public.oldkut_friendships;
create policy "oldkut_friendships_select" on public.oldkut_friendships for select
  using (
    auth.uid() in (requester_user_id, addressee_user_id)
    or (
      status = 'accepted'
      and (
        exists (
          select 1 from public.oldkut_profiles p
          where p.user_id = requester_user_id and p.is_private = false
        )
        or public.oldkut_is_accepted_friend(requester_user_id, auth.uid())
      )
      and (
        exists (
          select 1 from public.oldkut_profiles p
          where p.user_id = addressee_user_id and p.is_private = false
        )
        or public.oldkut_is_accepted_friend(addressee_user_id, auth.uid())
      )
    )
  );
