'use client';

import { useState, type FormEvent } from 'react';

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
      setError(body?.error ?? 'Não foi possível enviar o depoimento.');
      return;
    }

    setMessage('');
    setNotice('Depoimento enviado! Vai aparecer no perfil assim que for aprovado.');
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
      <div className="oldkut-box-title">Depoimentos{testimonials.length > 0 ? ` (${testimonials.length})` : ''}</div>
      <div className="oldkut-box-body">
        {canWrite && (
          <form className="oldkut-form" onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
            <textarea
              rows={3}
              placeholder="Escreva um depoimento..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            {error && <p className="oldkut-error">{error}</p>}
            {notice && <p className="oldkut-notice">{notice}</p>}
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="oldkut-btn" disabled={submitting || !message.trim()}>
                {submitting ? 'Enviando...' : 'Enviar depoimento'}
              </button>
            </div>
          </form>
        )}

        {!canWrite && !isOwnProfile && currentUserId && (
          <p className="oldkut-hint" style={{ marginBottom: 12 }}>
            <a href="/criar-perfil">Crie seu perfil</a> pra escrever um depoimento.
          </p>
        )}

        {testimonials.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>Nenhum depoimento ainda.</p>}

        {testimonials.map((t) => (
          <div key={t.id} className="oldkut-scrap">
            {t.authorPhotoUrl ? (
              <img src={t.authorPhotoUrl} alt={t.authorDisplayName} className="oldkut-scrap-avatar" />
            ) : (
              <div className="oldkut-scrap-avatar">{t.authorDisplayName?.[0]?.toUpperCase() ?? '?'}</div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/perfil/${t.authorUsername}`} className="oldkut-scrap-author">
                {t.authorDisplayName}
              </a>
              <span className="oldkut-scrap-date">{formatDate(t.createdAt)}</span>
              <div className="oldkut-scrap-message">{t.message}</div>
              {(isOwnProfile || t.authorUserId === currentUserId) && (
                <button type="button" className="oldkut-scrap-delete" onClick={() => handleDelete(t.id)}>
                  excluir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
