-- Amigos: pedido de amizade (pending) até ser aceito (accepted). Uma linha
-- por par de usuários — quem pediu é requester, quem recebeu é addressee.
-- Amizades aceitas são públicas (aparecem no perfil de qualquer um);
-- pedidos pendentes só são visíveis pras duas partes envolvidas.

create table if not exists public.oldkut_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  addressee_user_id uuid not null references public.oldkut_profiles(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint oldkut_friendships_no_self check (requester_user_id <> addressee_user_id),
  constraint oldkut_friendships_unique_pair unique (requester_user_id, addressee_user_id)
);

create index if not exists oldkut_friendships_addressee_idx on public.oldkut_friendships(addressee_user_id, status);
create index if not exists oldkut_friendships_requester_idx on public.oldkut_friendships(requester_user_id, status);

alter table public.oldkut_friendships enable row level security;

drop policy if exists "oldkut_friendships_select" on public.oldkut_friendships;
create policy "oldkut_friendships_select" on public.oldkut_friendships for select
  using (status = 'accepted' or auth.uid() in (requester_user_id, addressee_user_id));

drop policy if exists "oldkut_friendships_insert_own" on public.oldkut_friendships;
create policy "oldkut_friendships_insert_own" on public.oldkut_friendships for insert
  with check (auth.uid() = requester_user_id);

drop policy if exists "oldkut_friendships_update_addressee" on public.oldkut_friendships;
create policy "oldkut_friendships_update_addressee" on public.oldkut_friendships for update
  using (auth.uid() = addressee_user_id and status = 'pending')
  with check (status = 'accepted');

drop policy if exists "oldkut_friendships_delete_own" on public.oldkut_friendships;
create policy "oldkut_friendships_delete_own" on public.oldkut_friendships for delete
  using (auth.uid() in (requester_user_id, addressee_user_id));

grant select on public.oldkut_friendships to anon;
grant select, insert, update, delete on public.oldkut_friendships to authenticated;
grant select, insert, update, delete on public.oldkut_friendships to service_role;
