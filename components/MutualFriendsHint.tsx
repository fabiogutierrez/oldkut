'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

interface MutualFriend {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function MutualFriendsHint({ friends }: { friends: MutualFriend[] }) {
  const { t } = useLocale();

  if (friends.length === 0) return null;

  const shown = friends.slice(0, 3);

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-body" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex' }}>
          {shown.map((f, i) => (
            <a
              key={f.userId}
              href={`/perfil/${f.username}`}
              style={{ marginLeft: i > 0 ? -12 : 0, display: 'block', border: '2px solid #fff', borderRadius: 4 }}
            >
              {f.photoUrl ? (
                <img src={f.photoUrl} alt={f.displayName} className="oldkut-friend-avatar" style={{ width: 32, height: 32 }} />
              ) : (
                <div className="oldkut-friend-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                  {f.displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>
          {friends.length} {friends.length === 1 ? t('friend.mutualSingular') : t('friend.mutualPlural')}
        </span>
      </div>
    </div>
  );
}
