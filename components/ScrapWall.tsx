'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Scrap {
  id: string;
  message: string;
  createdAt: string;
  authorUserId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ScrapWall({
  profileUserId,
  initialScraps,
  currentUserId,
  isOwnProfile,
  canPost,
}: {
  profileUserId: string;
  initialScraps: Scrap[];
  currentUserId: string | null;
  isOwnProfile: boolean;
  canPost: boolean;
}) {
  const { t } = useLocale();
  const [scraps, setScraps] = useState(initialScraps);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/scraps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUserId, message: message.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? t('scrap.errorSubmit'));
      return;
    }

    const { scrap } = await res.json();
    setScraps((prev) => [scrap, ...prev]);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    const previous = scraps;
    setScraps((prev) => prev.filter((s) => s.id !== id));
    const res = await fetch(`/api/scraps?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setScraps(previous);
    }
  };

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {t('scrap.title')}
        {scraps.length > 0 ? ` (${scraps.length})` : ''}
      </div>
      <div className="oldkut-box-body">
        {canPost && (
          <form className="oldkut-form" onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
            <textarea
              rows={3}
              placeholder={t('scrap.placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            {error && <p className="oldkut-error">{error}</p>}
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="oldkut-btn" disabled={submitting || !message.trim()}>
                {submitting ? t('scrap.submitting') : t('scrap.submit')}
              </button>
            </div>
          </form>
        )}

        {!canPost && currentUserId && (
          <p className="oldkut-hint" style={{ marginBottom: 12 }}>
            <a href="/criar-perfil">{t('scrap.createProfileLink')}</a> {t('scrap.createProfileSuffix')}
          </p>
        )}

        {scraps.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>{t('scrap.empty')}</p>}

        {scraps.map((scrap) => (
          <div key={scrap.id} className="oldkut-scrap">
            {scrap.authorPhotoUrl ? (
              <img src={scrap.authorPhotoUrl} alt={scrap.authorDisplayName} className="oldkut-scrap-avatar" />
            ) : (
              <div className="oldkut-scrap-avatar">{scrap.authorDisplayName?.[0]?.toUpperCase() ?? '?'}</div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/perfil/${scrap.authorUsername}`} className="oldkut-scrap-author">
                {scrap.authorDisplayName}
              </a>
              <span className="oldkut-scrap-date">{formatDate(scrap.createdAt)}</span>
              <div className="oldkut-scrap-message">{scrap.message}</div>
              {(isOwnProfile || scrap.authorUserId === currentUserId) && (
                <button type="button" className="oldkut-scrap-delete" onClick={() => handleDelete(scrap.id)}>
                  {t('scrap.delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
