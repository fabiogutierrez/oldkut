'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';

interface PendingRequest {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function OldkutHeader({
  username,
  pendingRequests = [],
}: {
  username?: string | null;
  pendingRequests?: PendingRequest[];
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="oldkut-topbar">
      <Link href="/" className="oldkut-wordmark">
        oldkut<span>!</span>
      </Link>
      <div className="oldkut-topbar-right">
        {username ? (
          <>
            <NotificationBell initialRequests={pendingRequests} />
            <Link href={`/perfil/${username}`}>meu perfil</Link>
            <button type="button" onClick={handleLogout}>
              sair
            </button>
          </>
        ) : (
          <Link href="/login">entrar</Link>
        )}
      </div>
    </div>
  );
}
