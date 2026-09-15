import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="oldkut-landing">
        <h1>oldkut!</h1>
        <p>Adicione amigos, deixe recados no perfil de quem você conhece e relembre a época das comunidades.</p>
        <Link href="/login" className="oldkut-landing-link">
          Entrar ou criar conta
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();

  if (profile?.username) {
    redirect(`/perfil/${profile.username}`);
  }

  redirect('/criar-perfil');
}
