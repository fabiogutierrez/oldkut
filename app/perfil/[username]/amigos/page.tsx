import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import { getProfileAccess } from '@/lib/profileAccess';
import FriendsList from '@/components/FriendsList';

interface FriendProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

export default async function AmigosPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: profile } = await supabase
    .from('oldkut_profiles')
    .select('user_id, display_name, is_private')
    .eq('username', username)
    .maybeSingle();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { canSeePrivateContent } = await getProfileAccess(supabase, profile, user?.id);

  let friends: { userId: string; username: string; displayName: string; photoUrl: string | null }[] = [];

  if (canSeePrivateContent) {
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

    friends = [
      ...((asRequester as unknown as { addressee: FriendProfile | null }[] | null) ?? []).map((r) => r.addressee),
      ...((asAddressee as unknown as { requester: FriendProfile | null }[] | null) ?? []).map((r) => r.requester),
    ]
      .filter((f): f is FriendProfile => f !== null)
      .map((f) => ({ userId: f.user_id, username: f.username, displayName: f.display_name, photoUrl: f.photo_url }));
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link href={`/perfil/${username}`} className="oldkut-hint">
          {translate(locale, 'profile.backToProfile')}
        </Link>
      </div>

      {canSeePrivateContent ? (
        <FriendsList friends={friends} />
      ) : (
        <div className="oldkut-box">
          <div className="oldkut-box-title">{translate(locale, 'profile.privateNoticeTitle')}</div>
          <div className="oldkut-box-body">
            <p style={{ fontSize: 13, color: '#555' }}>{translate(locale, 'profile.privateNoticeBody')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
