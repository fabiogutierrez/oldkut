import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import CreateProfileForm from '@/components/CreateProfileForm';
import LogoutButton from '@/components/LogoutButton';

export default async function CriarPerfilPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();
  if (profile?.username) {
    redirect(`/perfil/${profile.username}`);
  }

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {translate(locale, 'profile.createTitle')}
        <LogoutButton className="oldkut-box-title-action" />
      </div>
      <div className="oldkut-box-body">
        <CreateProfileForm
          userId={user.id}
          defaultName={typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : ''}
          defaultBirthday={typeof user.user_metadata?.birthday === 'string' ? user.user_metadata.birthday : ''}
          defaultCountry={typeof user.user_metadata?.country === 'string' ? user.user_metadata.country : ''}
        />
      </div>
    </div>
  );
}
