'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface PersonResult {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

interface CommunityResult {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_private: boolean;
}

export default function SearchBox() {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [communities, setCommunities] = useState<CommunityResult[]>([]);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const term = query.trim();
    if (!term) {
      setPeople([]);
      setCommunities([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (requestId !== requestIdRef.current) return;
      const data = await res.json().catch(() => ({ people: [], communities: [] }));
      if (requestId !== requestIdRef.current) return;
      setPeople(data.people ?? []);
      setCommunities(data.communities ?? []);
      setSearched(true);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasResults = people.length > 0 || communities.length > 0;

  return (
    <div>
      <div className="oldkut-box">
        <div className="oldkut-box-title">{t('search.title')}</div>
        <div className="oldkut-box-body">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            autoFocus
            style={{
              width: '100%',
              fontFamily: 'inherit',
              fontSize: 13,
              padding: '6px 8px',
              border: '1px solid #a4bade',
              borderRadius: 3,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {!query.trim() && <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginTop: 20 }}>{t('search.prompt')}</p>}

      {query.trim() && searched && !hasResults && (
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginTop: 20 }}>{t('search.noResults')}</p>
      )}

      {people.length > 0 && (
        <div className="oldkut-box">
          <div className="oldkut-box-title">
            {t('search.peopleTitle')} ({people.length})
          </div>
          <div className="oldkut-box-body">
            {people.map((p) => (
              <a key={p.user_id} href={`/perfil/${p.username}`} className="oldkut-community-row">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.display_name} className="oldkut-community-avatar" loading="lazy" />
                ) : (
                  <div className="oldkut-community-avatar">{p.display_name?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="oldkut-community-name">{p.display_name}</div>
                  <div className="oldkut-community-desc">@{p.username}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {communities.length > 0 && (
        <div className="oldkut-box">
          <div className="oldkut-box-title">
            {t('search.communitiesTitle')} ({communities.length})
          </div>
          <div className="oldkut-box-body">
            {communities.map((c) => (
              <a key={c.id} href={`/comunidades/${c.id}`} className="oldkut-community-row">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.name} className="oldkut-community-avatar" loading="lazy" />
                ) : (
                  <div className="oldkut-community-avatar">{c.name?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="oldkut-community-name">
                    {c.name}
                    {c.is_private && ' 🔒'}
                  </div>
                  <div className="oldkut-community-desc">{c.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
