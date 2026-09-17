'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function ProfileStreak({ streak }: { streak: number }) {
  const { t } = useLocale();

  if (streak <= 0) return null;

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-body" style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 'bold', color: '#c0392b' }}>
          🔥 {streak} {streak === 1 ? t('streak.daySingular') : t('streak.dayPlural')}!
        </span>
      </div>
    </div>
  );
}
