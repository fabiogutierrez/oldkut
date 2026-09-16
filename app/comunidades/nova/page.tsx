import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import CreateCommunityForm from '@/components/CreateCommunityForm';

export const metadata = {
  title: 'Criar comunidade — oldkut',
};

export default async function NovaComunidadePage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('oldkut_profiles').select('user_id').eq('user_id', user.id).maybeSingle();
  if (!profile) {
    redirect('/criar-perfil');
  }

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">{translate(locale, 'community.submitCreate')}</div>
      <div className="oldkut-box-body">
        <CreateCommunityForm userId={user.id} />
      </div>
    </div>
  );
}
