'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Friend {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function FriendsList({
  friends,
  limit,
  viewMoreHref,
}: {
  friends: Friend[];
  limit?: number;
  viewMoreHref?: string;
}) {
  const { t } = useLocale();
  const visible = limit ? friends.slice(0, limit) : friends;
  const hasMore = limit !== undefined && friends.length > limit;

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {t('friend.sectionTitle')}
        {friends.length > 0 ? ` (${friends.length})` : ''}
      </div>
      <div className="oldkut-box-body">
        {friends.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>{t('friend.noneYet')}</p>}
        <div className={limit ? 'oldkut-friend-grid oldkut-friend-grid-preview' : 'oldkut-friend-grid'}>
          {visible.map((f) => (
            <a key={f.userId} href={`/perfil/${f.username}`} className="oldkut-friend-item">
              {f.photoUrl ? (
                <img src={f.photoUrl} alt={f.displayName} className="oldkut-friend-avatar" />
              ) : (
                <div className="oldkut-friend-avatar">{f.displayName?.[0]?.toUpperCase() ?? '?'}</div>
              )}
              <div className="oldkut-friend-name">{f.displayName}</div>
            </a>
          ))}
        </div>
        {hasMore && viewMoreHref && (
          <a href={viewMoreHref} className="oldkut-viewmore">
            {t('common.viewMore')}
          </a>
        )}
      </div>
    </div>
  );
}
