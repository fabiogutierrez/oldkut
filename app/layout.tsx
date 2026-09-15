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

interface RequesterProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let pendingRequests: { userId: string; username: string; displayName: string; photoUrl: string | null }[] = [];

  if (user) {
    const { data } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();
    username = data?.username ?? null;

    if (username) {
      const { data: pendingRaw } = await supabase
        .from('oldkut_friendships')
        .select('requester:oldkut_profiles!oldkut_friendships_requester_user_id_fkey(user_id, username, display_name, photo_url)')
        .eq('addressee_user_id', user.id)
        .eq('status', 'pending');

      pendingRequests = ((pendingRaw as unknown as { requester: RequesterProfile | null }[] | null) ?? [])
        .map((r) => r.requester)
        .filter((r): r is RequesterProfile => r !== null)
        .map((r) => ({ userId: r.user_id, username: r.username, displayName: r.display_name, photoUrl: r.photo_url }));
    }
  }

  return (
    <html lang="pt-BR">
      <body>
        <div className="oldkut-shell">
          <OldkutHeader username={username} pendingRequests={pendingRequests} />
          <div className="oldkut-container">{children}</div>
        </div>
      </body>
    </html>
  );
}
