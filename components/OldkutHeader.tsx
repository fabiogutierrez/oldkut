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
        <Link href="/buscar" className="oldkut-icon-btn" aria-label={t('search.ariaLabel')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </Link>
        {username ? <NotificationBell initialNotifications={notifications} /> : <Link href="/login">{t('nav.login')}</Link>}
        <LanguageSwitcher />
      </div>
    </div>
  );
}
