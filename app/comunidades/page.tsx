import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CommunitiesList from '@/components/CommunitiesList';

export const metadata = {
  title: 'Comunidades — oldkut',
};

interface CommunityRow {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  oldkut_community_members: { count: number }[];
}

export default async function ComunidadesPage() {
  const supabase = await createClient();

  const { data: communitiesRaw } = await supabase
    .from('oldkut_communities')
    .select('id, name, description, photo_url, oldkut_community_members(count)')
    .order('created_at', { ascending: false });

  const communities = ((communitiesRaw as unknown as CommunityRow[]) ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    photoUrl: c.photo_url,
    memberCount: c.oldkut_community_members?.[0]?.count ?? 0,
  }));

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        Comunidades{communities.length > 0 ? ` (${communities.length})` : ''}
        <Link href="/comunidades/nova" className="oldkut-box-title-action">
          + Criar comunidade
        </Link>
      </div>
      <div className="oldkut-box-body">
        <CommunitiesList communities={communities} />
      </div>
    </div>
  );
}
