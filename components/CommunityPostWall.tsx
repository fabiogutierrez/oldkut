'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface CommunityPost {
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

export default function CommunityPostWall({
  communityId,
  initialPosts,
  currentUserId,
  isCreator,
  canPost,
}: {
  communityId: string;
  initialPosts: CommunityPost[];
  currentUserId: string | null;
  isCreator: boolean;
  canPost: boolean;
}) {
  const { t } = useLocale();
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/communities/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId, message: message.trim() }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? t('community.errorName'));
      return;
    }

    const { post } = await res.json();
    setPosts((prev) => [post, ...prev]);
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    const res = await fetch(`/api/communities/posts?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setPosts(previous);
    }
  };

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">
        {t('community.postsTitle')}
        {posts.length > 0 ? ` (${posts.length})` : ''}
      </div>
      <div className="oldkut-box-body">
        {canPost && (
          <form className="oldkut-form" onSubmit={handleSubmit} style={{ marginBottom: 14 }}>
            <textarea
              rows={3}
              placeholder={t('community.postPlaceholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
            />
            {error && <p className="oldkut-error">{error}</p>}
            <div style={{ marginTop: 8 }}>
              <button type="submit" className="oldkut-btn" disabled={submitting || !message.trim()}>
                {submitting ? t('community.postSubmitting') : t('community.postSubmit')}
              </button>
            </div>
          </form>
        )}

        {posts.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>{t('community.postEmpty')}</p>}

        {posts.map((post) => (
          <div key={post.id} className="oldkut-scrap">
            {post.authorPhotoUrl ? (
              <img src={post.authorPhotoUrl} alt={post.authorDisplayName} className="oldkut-scrap-avatar" />
            ) : (
              <div className="oldkut-scrap-avatar">{post.authorDisplayName?.[0]?.toUpperCase() ?? '?'}</div>
            )}
            <div style={{ flex: 1 }}>
              <a href={`/perfil/${post.authorUsername}`} className="oldkut-scrap-author">
                {post.authorDisplayName}
              </a>
              <span className="oldkut-scrap-date">{formatDate(post.createdAt)}</span>
              <div className="oldkut-scrap-message">{post.message}</div>
              {(isCreator || post.authorUserId === currentUserId) && (
                <button type="button" className="oldkut-scrap-delete" onClick={() => handleDelete(post.id)}>
                  {t('community.delete')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
