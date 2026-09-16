import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import CreateCommunityForm from '@/components/CreateCommunityForm';

export default async function EditarComunidadePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: community } = await supabase
    .from('oldkut_communities')
    .select('id, name, description, photo_url, creator_user_id, is_private')
    .eq('id', id)
    .maybeSingle();

  if (!community) notFound();
  if (community.creator_user_id !== user.id) {
    redirect(`/comunidades/${id}`);
  }

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">{translate(locale, 'community.editTitle')}</div>
      <div className="oldkut-box-body">
        <CreateCommunityForm
          mode="edit"
          userId={user.id}
          communityId={community.id}
          defaultName={community.name}
          defaultDescription={community.description ?? ''}
          defaultPhotoUrl={community.photo_url}
          defaultIsPrivate={community.is_private}
        />
      </div>
    </div>
  );
}
