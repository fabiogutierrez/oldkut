import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import { getProfileAccess } from '@/lib/profileAccess';
import ProfileCommunities from '@/components/ProfileCommunities';

interface CommunityRow {
  id: string;
  name: string;
  photo_url: string | null;
}

export default async function PerfilComunidadesPage({ params }: { params: Promise<{ username: string }> }) {
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

  let communities: { id: string; name: string; photoUrl: string | null }[] = [];

  if (canSeePrivateContent) {
    const { data: communitiesRaw } = await supabase
      .from('oldkut_community_members')
      .select('community:oldkut_communities(id, name, photo_url)')
      .eq('user_id', profile.user_id);

    communities = ((communitiesRaw as unknown as { community: CommunityRow | null }[] | null) ?? [])
      .map((c) => c.community)
      .filter((c): c is CommunityRow => c !== null)
      .map((c) => ({ id: c.id, name: c.name, photoUrl: c.photo_url }));
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link href={`/perfil/${username}`} className="oldkut-hint">
          {translate(locale, 'profile.backToProfile')}
        </Link>
      </div>

      {canSeePrivateContent ? (
        <ProfileCommunities communities={communities} />
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
