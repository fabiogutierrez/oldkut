'use client';

import Link from 'next/link';
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
  const { t } = useLocale();

  return (
    <div className="oldkut-topbar">
      <Link href="/" className="oldkut-wordmark">
        oldkut<span>!</span>
      </Link>
      <div className="oldkut-topbar-right">
        {username ? <NotificationBell initialNotifications={notifications} /> : <Link href="/login">{t('nav.login')}</Link>}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
