'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import type { Notification } from '@/lib/notifications';

export default function OldkutHeader({
  username,
  notifications = [],
}: {
  username?: string | null;
  notifications?: Notification[];
}) {
  const router = useRouter();
  const { t } = useLocale();

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
        <Link href="/comunidades">{t('nav.communities')}</Link>
        {username ? (
          <>
            <NotificationBell initialNotifications={notifications} />
            <Link href={`/perfil/${username}`}>{t('nav.myProfile')}</Link>
            <button type="button" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <Link href="/login">{t('nav.login')}</Link>
        )}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
