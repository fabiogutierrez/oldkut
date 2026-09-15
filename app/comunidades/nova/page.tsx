import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateCommunityForm from '@/components/CreateCommunityForm';

export const metadata = {
  title: 'Criar comunidade — oldkut',
};

export default async function NovaComunidadePage() {
  const supabase = await createClient();
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
      <div className="oldkut-box-title">Criar comunidade</div>
      <div className="oldkut-box-body">
        <CreateCommunityForm userId={user.id} />
      </div>
    </div>
  );
}
