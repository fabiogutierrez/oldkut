'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import LogoutButton from '@/components/LogoutButton';

export default function ProfileSidebarActions({ username }: { username: string }) {
  const { t } = useLocale();

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-body oldkut-sidebar-actions">
        <Link href="/perfil/editar" className="oldkut-btn oldkut-btn-block">
          {t('profile.editLink')}
        </Link>
        <Link href={`/perfil/${username}/amigos`} className="oldkut-btn oldkut-btn-block oldkut-btn-outline">
          Amigos
        </Link>
        <Link href="/comunidades" className="oldkut-btn oldkut-btn-block oldkut-btn-outline">
          {t('nav.communities')}
        </Link>
        <LogoutButton className="oldkut-btn oldkut-btn-block oldkut-btn-ghost" />
      </div>
    </div>
  );
}
