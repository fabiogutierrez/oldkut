'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import type { Notification } from '@/lib/notifications';

export default function OldkutHeader({
  username,
  notifications = [],
}: {
  username?: string | null;
  notifications?: Notification[];
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
            <NotificationBell initialNotifications={notifications} />
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
