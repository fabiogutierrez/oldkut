'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Visitor {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function ProfileVisits({ totalCount, visitors }: { totalCount: number; visitors: Visitor[] }) {
  const { t } = useLocale();

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">{t('profile.visitsTitle')}</div>
      <div className="oldkut-box-body">
        <p className="oldkut-hint" style={{ marginBottom: 8 }}>
          👀 {totalCount} {t('profile.visitsCount')}
        </p>
        {visitors.length === 0 ? (
          <p style={{ fontSize: 13, color: '#777' }}>{t('profile.visitsEmpty')}</p>
        ) : (
          <div className="oldkut-friend-grid oldkut-friend-grid-preview">
            {visitors.map((v) => (
              <a key={v.userId} href={`/perfil/${v.username}`} className="oldkut-friend-item">
                {v.photoUrl ? (
                  <img src={v.photoUrl} alt={v.displayName} className="oldkut-friend-avatar" loading="lazy" />
                ) : (
                  <div className="oldkut-friend-avatar">{v.displayName?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div className="oldkut-friend-name">{v.displayName}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
