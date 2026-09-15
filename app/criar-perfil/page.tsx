import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateProfileForm from '@/components/CreateProfileForm';

export default async function CriarPerfilPage() {
  const supabase = await createClient();
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
      <div className="oldkut-box-title">Criar seu perfil</div>
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
