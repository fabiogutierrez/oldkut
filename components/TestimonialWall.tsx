'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Testimonial {
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

export default function TestimonialWall({
  profileUserId,
  initialTestimonials,
  currentUserId,
  isOwnProfile,
  canWrite,
}: {
  profileUserId: string;
  initialTestimonials: Testimonial[];
  currentUserId: string | null;
  isOwnProfile: boolean;
  canWrite: boolean;
}) {
  const { t } = useLocale();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);

    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileUserId, message: message.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? t('testimonial.errorSubmit'));
      return;
    }

    setMessage('');
    setNotice(t('testimonial.submitSuccess'));
  };

  const handleDelete = async (id: string) => {
    const previous = testimonials;
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setTestimonials(previous);
    }
  };

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {t('testimonial.title')}
        {testimonials.length > 0 ? ` (${testimonials.length})` : ''}
      </div>
      <div className="oldkut-box-body">
        {canWrite && (
          <form className="oldkut-form" onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
            <textarea
              rows={3}
              placeholder={t('testimonial.placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            {error && <p className="oldkut-error">{error}</p>}
            {notice && <p className="oldkut-notice">{notice}</p>}
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="oldkut-btn" disabled={submitting || !message.trim()}>
                {submitting ? t('testimonial.submitting') : t('testimonial.submit')}
              </button>
            </div>
          </form>
        )}

        {!canWrite && !isOwnProfile && currentUserId && (
          <p className="oldkut-hint" style={{ marginBottom: 12 }}>
            <a href="/criar-perfil">{t('testimonial.createProfileLink')}</a> {t('testimonial.createProfileSuffix')}
          </p>
        )}

        {testimonials.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>{t('testimonial.empty')}</p>}

        {testimonials.map((item) => (
          <div key={item.id} className="oldkut-scrap">
            {item.authorPhotoUrl ? (
              <img src={item.authorPhotoUrl} alt={item.authorDisplayName} className="oldkut-scrap-avatar" loading="lazy" />
            ) : (
              <div className="oldkut-scrap-avatar">{item.authorDisplayName?.[0]?.toUpperCase() ?? '?'}</div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/perfil/${item.authorUsername}`} className="oldkut-scrap-author">
                {item.authorDisplayName}
              </a>
              <span className="oldkut-scrap-date">{formatDate(item.createdAt)}</span>
              <div className="oldkut-scrap-message">{item.message}</div>
              {(isOwnProfile || item.authorUserId === currentUserId) && (
                <button type="button" className="oldkut-scrap-delete" onClick={() => handleDelete(item.id)}>
                  {t('testimonial.delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
