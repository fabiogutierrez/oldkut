import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import CommunitiesList from '@/components/CommunitiesList';

export const metadata = {
  title: 'Comunidades — oldkut',
};

interface CommunityRow {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_private: boolean;
  oldkut_community_members: { count: number }[];
}

export default async function ComunidadesPage() {
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: communitiesRaw, error: communitiesError } = await supabase
    .from('oldkut_communities')
    .select('id, name, description, photo_url, is_private, oldkut_community_members(count)')
    .order('created_at', { ascending: false });

  if (communitiesError) {
    console.error('Falha ao carregar comunidades:', communitiesError);
  }

  const communities = ((communitiesRaw as unknown as CommunityRow[]) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    photoUrl: c.photo_url,
    isPrivate: c.is_private,
    memberCount: c.oldkut_community_members?.[0]?.count ?? 0,
  }));

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {translate(locale, 'nav.communities')}
        {communities.length > 0 ? ` (${communities.length})` : ''}
        <Link href="/comunidades/nova" className="oldkut-box-title-action">
          + {translate(locale, 'community.submitCreate')}
        </Link>
      </div>
      <div className="oldkut-box-body">
        {communitiesError && (
          <p style={{ color: '#a00', fontSize: 12, marginBottom: 10 }}>
            Erro ao carregar comunidades: {communitiesError.message}
          </p>
        )}
        <CommunitiesList communities={communities} />
      </div>
    </div>
  );
}
