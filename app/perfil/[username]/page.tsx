import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileCard from '@/components/ProfileCard';
import ScrapWall from '@/components/ScrapWall';
import FriendButton from '@/components/FriendButton';
import FriendsList from '@/components/FriendsList';

interface ScrapAuthor {
  username: string | null;
  display_name: string | null;
  photo_url: string | null;
}

interface ScrapRow {
  id: string;
  message: string;
  created_at: string;
  author_user_id: string;
  author: ScrapAuthor | null;
}

interface FriendProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

export default async function PerfilPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase.from('oldkut_profiles').select('*').eq('username', username).maybeSingle();
  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: scrapsRaw } = await supabase
    .from('oldkut_scraps')
    .select(
      'id, message, created_at, author_user_id, author:oldkut_profiles!oldkut_scraps_author_user_id_fkey(username, display_name, photo_url)'
    )
    .eq('profile_user_id', profile.user_id)
    .order('created_at', { ascending: false });

  const scraps = ((scrapsRaw as unknown as ScrapRow[]) ?? []).map((s) => ({
    id: s.id,
    message: s.message,
    createdAt: s.created_at,
    authorUserId: s.author_user_id,
    authorUsername: s.author?.username ?? '',
    authorDisplayName: s.author?.display_name ?? '?',
    authorPhotoUrl: s.author?.photo_url ?? null,
  }));

  const isOwnProfile = user?.id === profile.user_id;
  let canPost = isOwnProfile;
  if (user && !isOwnProfile) {
    const { data: viewerProfile } = await supabase.from('oldkut_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
    canPost = !!viewerProfile;
  }

  const [{ data: asRequester }, { data: asAddressee }] = await Promise.all([
    supabase
      .from('oldkut_friendships')
      .select('addressee:oldkut_profiles!oldkut_friendships_addressee_user_id_fkey(user_id, username, display_name, photo_url)')
      .eq('requester_user_id', profile.user_id)
      .eq('status', 'accepted'),
    supabase
      .from('oldkut_friendships')
      .select('requester:oldkut_profiles!oldkut_friendships_requester_user_id_fkey(user_id, username, display_name, photo_url)')
      .eq('addressee_user_id', profile.user_id)
      .eq('status', 'accepted'),
  ]);

  const friends = [
    ...((asRequester as unknown as { addressee: FriendProfile | null }[] | null) ?? []).map((r) => r.addressee),
    ...((asAddressee as unknown as { requester: FriendProfile | null }[] | null) ?? []).map((r) => r.requester),
  ]
    .filter((f): f is FriendProfile => f !== null)
    .map((f) => ({ userId: f.user_id, username: f.username, displayName: f.display_name, photoUrl: f.photo_url }));

  let friendStatus: 'none' | 'pending_sent' | 'pending_received' | 'accepted' = 'none';
  if (user && !isOwnProfile) {
    const { data: rel } = await supabase
      .from('oldkut_friendships')
      .select('requester_user_id, status')
      .or(
        `and(requester_user_id.eq.${user.id},addressee_user_id.eq.${profile.user_id}),and(requester_user_id.eq.${profile.user_id},addressee_user_id.eq.${user.id})`
      )
      .maybeSingle();

    if (rel) {
      friendStatus = rel.status === 'accepted' ? 'accepted' : rel.requester_user_id === user.id ? 'pending_sent' : 'pending_received';
    }
  }

  return (
    <div className="oldkut-layout">
      <div className="oldkut-sidebar">
        <ProfileCard profile={profile} />
        {!isOwnProfile && canPost && (
          <div className="oldkut-box">
            <div className="oldkut-box-body">
              <FriendButton targetUserId={profile.user_id} initialStatus={friendStatus} />
            </div>
          </div>
        )}
        <FriendsList friends={friends} />
      </div>
      <div className="oldkut-main">
        <ScrapWall
          profileUserId={profile.user_id}
          initialScraps={scraps}
          currentUserId={user?.id ?? null}
          isOwnProfile={isOwnProfile}
          canPost={canPost}
        />
      </div>
    </div>
  );
}
