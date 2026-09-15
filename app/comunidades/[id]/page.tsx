import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import JoinCommunityButton from '@/components/JoinCommunityButton';

interface MemberProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

export default async function ComunidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: community } = await supabase
    .from('oldkut_communities')
    .select('id, name, description, photo_url, creator_user_id, creator:oldkut_profiles!oldkut_communities_creator_user_id_fkey(username, display_name)')
    .eq('id', id)
    .maybeSingle();

  if (!community) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membersRaw } = await supabase
    .from('oldkut_community_members')
    .select('user:oldkut_profiles!oldkut_community_members_user_id_fkey(user_id, username, display_name, photo_url)')
    .eq('community_id', id);

  const members = ((membersRaw as unknown as { user: MemberProfile | null }[] | null) ?? [])
    .map((m) => m.user)
    .filter((m): m is MemberProfile => m !== null);

  const isMember = !!user && members.some((m) => m.user_id === user.id);
  let canAct = false;
  if (user) {
    const { data: viewerProfile } = await supabase.from('oldkut_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
    canAct = !!viewerProfile;
  }

  const creator = community.creator as unknown as { username: string; display_name: string } | null;

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">{community.name}</div>
      <div className="oldkut-box-body">
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          {community.photo_url ? (
            <img
              src={community.photo_url}
              alt={community.name}
              className="oldkut-avatar"
              style={{ width: 90, height: 90, flexShrink: 0 }}
            />
          ) : (
            <div className="oldkut-avatar" style={{ width: 90, height: 90, flexShrink: 0, fontSize: 28 }}>
              {community.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{community.description}</p>
            {creator && (
              <p className="oldkut-hint">
                Criada por{' '}
                <a href={`/perfil/${creator.username}`} style={{ color: '#315286', fontWeight: 'bold' }}>
                  {creator.display_name}
                </a>
              </p>
            )}
            <div style={{ marginTop: 10 }}>
              {canAct && <JoinCommunityButton communityId={community.id} initialIsMember={isMember} />}
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 13, color: '#315286', margin: '0 0 10px' }}>
          Membros ({members.length})
        </h3>
        {members.length === 0 ? (
          <p style={{ fontSize: 13, color: '#666' }}>Nenhum membro ainda.</p>
        ) : (
          <div className="oldkut-friend-grid">
            {members.map((m) => (
              <a key={m.user_id} href={`/perfil/${m.username}`} className="oldkut-friend-item">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.display_name} className="oldkut-friend-avatar" />
                ) : (
                  <div className="oldkut-friend-avatar">{m.display_name?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div className="oldkut-friend-name">{m.display_name}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
