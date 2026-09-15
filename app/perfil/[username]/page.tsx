import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileCard from '@/components/ProfileCard';
import ScrapWall from '@/components/ScrapWall';

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

  return (
    <div className="oldkut-layout">
      <div className="oldkut-sidebar">
        <ProfileCard profile={profile} />
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
