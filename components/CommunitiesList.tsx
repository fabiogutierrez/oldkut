'use client';

import { useMemo, useState } from 'react';

interface Community {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  memberCount: number;
}

export default function CommunitiesList({ communities }: { communities: Community[] }) {
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
        placeholder="Buscar comunidades..."
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

      {filtered.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Nenhuma comunidade encontrada.</p>}

      {filtered.map((c) => (
        <a key={c.id} href={`/comunidades/${c.id}`} className="oldkut-community-row">
          {c.photoUrl ? (
            <img src={c.photoUrl} alt={c.name} className="oldkut-community-avatar" />
          ) : (
            <div className="oldkut-community-avatar">{c.name?.[0]?.toUpperCase() ?? '?'}</div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="oldkut-community-name">{c.name}</div>
            <div className="oldkut-community-desc">{c.description}</div>
            <div className="oldkut-community-count">
              {c.memberCount} {c.memberCount === 1 ? 'membro' : 'membros'}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
