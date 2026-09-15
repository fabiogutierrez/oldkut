import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import JoinCommunityButton from '@/components/JoinCommunityButton';
import CommunityPostWall from '@/components/CommunityPostWall';

interface MemberProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

interface PostAuthor {
  username: string | null;
  display_name: string | null;
  photo_url: string | null;
}

interface PostRow {
  id: string;
  message: string;
  created_at: string;
  author_user_id: string;
  author: PostAuthor | null;
}

export default async function ComunidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: community } = await supabase
    .from('oldkut_communities')
    .select(
      'id, name, description, photo_url, creator_user_id, is_private, creator:oldkut_profiles!oldkut_communities_creator_user_id_fkey(username, display_name)'
    )
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

  const isMember =
    !!user && (community.creator_user_id === user.id || members.some((m) => m.user_id === user.id));
  let canAct = false;
  if (user) {
    const { data: viewerProfile } = await supabase.from('oldkut_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
    canAct = !!viewerProfile;
  }

  const canSeeContent = !community.is_private || isMember;

  let posts: {
    id: string;
    message: string;
    createdAt: string;
    authorUserId: string;
    authorUsername: string;
    authorDisplayName: string;
    authorPhotoUrl: string | null;
  }[] = [];

  if (canSeeContent) {
    const { data: postsRaw } = await supabase
      .from('oldkut_community_posts')
      .select(
        'id, message, created_at, author_user_id, author:oldkut_profiles!oldkut_community_posts_author_user_id_fkey(username, display_name, photo_url)'
      )
      .eq('community_id', id)
      .order('created_at', { ascending: false });

    posts = ((postsRaw as unknown as PostRow[]) ?? []).map((p) => ({
      id: p.id,
      message: p.message,
      createdAt: p.created_at,
      authorUserId: p.author_user_id,
      authorUsername: p.author?.username ?? '',
      authorDisplayName: p.author?.display_name ?? '?',
      authorPhotoUrl: p.author?.photo_url ?? null,
    }));
  }

  const creator = community.creator as unknown as { username: string; display_name: string } | null;
  const isCreator = user?.id === community.creator_user_id;

  return (
    <>
      <div className="oldkut-box">
        <div className="oldkut-box-title">
          {community.name}
          {isCreator && (
            <Link href={`/comunidades/${community.id}/editar`} className="oldkut-box-title-action">
              {translate(locale, 'community.editLink')}
            </Link>
          )}
        </div>
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
              {community.is_private && (
                <p className="oldkut-hint" style={{ marginBottom: 4 }}>
                  {translate(locale, 'community.privateBadge')}
                </p>
              )}
              <p style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{community.description}</p>
              {creator && (
                <p className="oldkut-hint">
                  {translate(locale, 'community.createdBy')}{' '}
                  <a href={`/perfil/${creator.username}`} style={{ color: '#315286', fontWeight: 'bold' }}>
                    {creator.display_name}
                  </a>
                </p>
              )}
              <div style={{ marginTop: 10 }}>
                {canAct && !isCreator && <JoinCommunityButton communityId={community.id} initialIsMember={isMember} />}
              </div>
            </div>
          </div>

          {canSeeContent ? (
            <>
              <h3 style={{ fontSize: 13, color: '#315286', margin: '0 0 10px' }}>
                {translate(locale, 'community.membersTitle')} ({members.length})
              </h3>
              {members.length === 0 ? (
                <p style={{ fontSize: 13, color: '#666' }}>{translate(locale, 'community.membersEmpty')}</p>
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
            </>
          ) : (
            <div>
              <h3 style={{ fontSize: 13, color: '#315286', margin: '0 0 6px' }}>
                {translate(locale, 'community.privateNoticeTitle')}
              </h3>
              <p style={{ fontSize: 13, color: '#555' }}>{translate(locale, 'community.privateNoticeBody')}</p>
            </div>
          )}
        </div>
      </div>

      {canSeeContent && (
        <CommunityPostWall
          communityId={community.id}
          initialPosts={posts}
          currentUserId={user?.id ?? null}
          isCreator={isCreator}
          canPost={isMember}
        />
      )}
    </>
  );
}
