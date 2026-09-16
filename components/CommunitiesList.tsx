'use client';

import { useMemo, useState } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Community {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  isPrivate: boolean;
  memberCount: number;
}

export default function CommunitiesList({ communities }: { communities: Community[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter((c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
  }, [communities, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('community.searchPlaceholder')}
        style={{
          width: '100%',
          fontFamily: 'inherit',
          fontSize: 13,
          padding: '6px 8px',
          border: '1px solid #a4bade',
          borderRadius: 3,
          boxSizing: 'border-box',
          marginBottom: 14,
        }}
      />

      {filtered.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>{t('community.searchEmpty')}</p>}

      {filtered.map((c) => (
        <a key={c.id} href={`/comunidades/${c.id}`} className="oldkut-community-row">
          {c.photoUrl ? (
            <img src={c.photoUrl} alt={c.name} className="oldkut-community-avatar" loading="lazy" />
          ) : (
            <div className="oldkut-community-avatar">{c.name?.[0]?.toUpperCase() ?? '?'}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oldkut-community-name">
              {c.name}
              {c.isPrivate && ' 🔒'}
            </div>
            <div className="oldkut-community-desc">{c.description}</div>
            <div className="oldkut-community-count">
              {c.memberCount} {c.memberCount === 1 ? t('community.memberSingular') : t('community.memberPlural')}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
