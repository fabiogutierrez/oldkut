import type { SupabaseClient } from '@supabase/supabase-js';

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export async function getProfileAccess(
  supabase: SupabaseClient,
  profile: { user_id: string; is_private: boolean },
  viewerUserId: string | undefined
) {
  const isOwnProfile = viewerUserId === profile.user_id;
  let friendStatus: FriendStatus = 'none';

  if (viewerUserId && !isOwnProfile) {
    const { data: rel } = await supabase
      .from('oldkut_friendships')
      .select('requester_user_id, status')
      .or(
        `and(requester_user_id.eq.${viewerUserId},addressee_user_id.eq.${profile.user_id}),and(requester_user_id.eq.${profile.user_id},addressee_user_id.eq.${viewerUserId})`
      )
      .maybeSingle();

    if (rel) {
      friendStatus = rel.status === 'accepted' ? 'accepted' : rel.requester_user_id === viewerUserId ? 'pending_sent' : 'pending_received';
    }
  }

  const canSeePrivateContent = isOwnProfile || friendStatus === 'accepted' || !profile.is_private;

  return { isOwnProfile, friendStatus, canSeePrivateContent };
}
