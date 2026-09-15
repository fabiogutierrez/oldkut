drop policy if exists "oldkut_communities_update_own" on public.oldkut_communities;
create policy "oldkut_communities_update_own" on public.oldkut_communities for update
  using (auth.uid() = creator_user_id);
