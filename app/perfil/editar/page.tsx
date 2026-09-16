import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';
import CreateProfileForm from '@/components/CreateProfileForm';
import DeleteAccountButton from '@/components/DeleteAccountButton';

export const metadata = {
  title: 'Editar perfil — oldkut',
};

export default async function EditarPerfilPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('oldkut_profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (!profile) {
    redirect('/criar-perfil');
  }

  return (
    <>
      <div className="oldkut-box">
        <div className="oldkut-box-title">Editar perfil</div>
        <div className="oldkut-box-body">
          <CreateProfileForm
            mode="edit"
            userId={user.id}
            defaultUsername={profile.username}
            defaultName={profile.display_name}
            defaultPhotoUrl={profile.photo_url}
            defaultCity={profile.city ?? ''}
            defaultBirthday={profile.birthday ?? ''}
            defaultCountry={profile.country ?? ''}
            defaultBio={profile.bio ?? ''}
            defaultIsPrivate={profile.is_private ?? false}
          />
        </div>
      </div>

      <div className="oldkut-box oldkut-danger-zone">
        <div className="oldkut-box-title">{translate(locale, 'account.dangerZoneTitle')}</div>
        <div className="oldkut-box-body">
          <DeleteAccountButton />
        </div>
      </div>
    </>
  );
}
