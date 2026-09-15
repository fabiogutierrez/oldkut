import type { Metadata, Viewport } from 'next';
import { createClient } from '@/lib/supabase/server';
import OldkutHeader from '@/components/OldkutHeader';
import './globals.css';

export const metadata: Metadata = {
  title: 'oldkut',
  description: 'Adicione amigos, deixe recados e relembre a época das comunidades.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();
    username = data?.username ?? null;
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="oldkut-shell">
          <OldkutHeader username={username} />
          <div className="oldkut-container">{children}</div>
        </div>
      </body>
    </html>
  );
}
