import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LandingContent from '@/components/LandingContent';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingContent />;
  }

  const { data: profile } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();

  if (profile?.username) {
    redirect(`/perfil/${profile.username}`);
  }

  redirect('/criar-perfil');
}
