import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateProfileForm from '@/components/CreateProfileForm';

export const metadata = {
  title: 'Editar perfil — oldkut',
};

export default async function EditarPerfilPage() {
  const supabase = await createClient();
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
  );
}
