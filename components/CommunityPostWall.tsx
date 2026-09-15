'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from '@/lib/i18n/LocaleProvider';

interface CommunityReply {
  id: string;
  message: string;
  createdAt: string;
  authorUserId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
}

interface CommunityPost {
  id: string;
  message: string;
  createdAt: string;
  authorUserId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoUrl: string | null;
  likeCount: number;
  likedByMe: boolean;
  replies: CommunityReply[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function PostItem({
  post,
  isCreator,
  currentUserId,
  canReply,
  onDelete,
}: {
  post: CommunityPost;
  isCreator: boolean;
  currentUserId: string | null;
  canReply: boolean;
  onDelete: (id: string) => void;
}) {
  const { t } = useLocale();
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe);
  const [likePending, setLikePending] = useState(false);
  const [replies, setReplies] = useState(post.replies);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const toggleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    const wasLiked = likedByMe;
    setLikedByMe(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    const res = wasLiked
      ? await fetch(`/api/communities/posts/likes?postId=${post.id}`, { method: 'DELETE' })
      : await fetch('/api/communities/posts/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId: post.id }),
        });

    setLikePending(false);

    if (!res.ok) {
      setLikedByMe(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplySubmitting(true);
    setReplyError(null);

    const res = await fetch('/api/communities/posts/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, message: replyMessage.trim() }),
    });

    setReplySubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setReplyError(body?.error ?? t('community.errorName'));
      return;
    }

    const { reply } = await res.json();
    setReplies((prev) => [...prev, reply]);
    setReplyMessage('');
  };

  const handleReplyDelete = async (id: string) => {
    const previous = replies;
    setReplies((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/communities/posts/replies?id=${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setReplies(previous);
    }
  };

  return (
    <div className="oldkut-scrap">
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

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
          <button
            type="button"
            className="oldkut-scrap-delete"
            onClick={toggleLike}
            disabled={!currentUserId || likePending}
            style={{ color: likedByMe ? '#315286' : undefined, fontWeight: likedByMe ? 'bold' : undefined }}
          >
            {likedByMe ? `★ ${t('community.liked')}` : `☆ ${t('community.like')}`}
            {likeCount > 0 ? ` (${likeCount})` : ''}
          </button>

          {canReply && (
            <button type="button" className="oldkut-scrap-delete" onClick={() => setShowReplyForm((v) => !v)}>
              {t('community.reply')}
            </button>
          )}

          {(isCreator || post.authorUserId === currentUserId) && (
            <button type="button" className="oldkut-scrap-delete" onClick={() => onDelete(post.id)}>
              {t('community.delete')}
            </button>
          )}
        </div>

        {replies.length > 0 && (
          <div style={{ marginTop: 8, paddingLeft: 14, borderLeft: '2px solid #dce6f5' }}>
            {replies.map((reply) => (
              <div key={reply.id} style={{ marginBottom: 8 }}>
                <a href={`/perfil/${reply.authorUsername}`} className="oldkut-scrap-author">
                  {reply.authorDisplayName}
                </a>
                <span className="oldkut-scrap-date">{formatDate(reply.createdAt)}</span>
                <div className="oldkut-scrap-message">{reply.message}</div>
                {(isCreator || reply.authorUserId === currentUserId) && (
                  <button type="button" className="oldkut-scrap-delete" onClick={() => handleReplyDelete(reply.id)}>
                    {t('community.delete')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {canReply && showReplyForm && (
          <form className="oldkut-form" onSubmit={handleReplySubmit} style={{ marginTop: 8 }}>
            <textarea
              rows={2}
              placeholder={t('community.replyPlaceholder')}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              maxLength={1000}
            />
            {replyError && <p className="oldkut-error">{replyError}</p>}
            <div style={{ marginTop: 6 }}>
              <button type="submit" className="oldkut-btn" disabled={replySubmitting || !replyMessage.trim()}>
                {replySubmitting ? t('community.replySubmitting') : t('community.replySubmit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
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
    setPosts((prev) => [{ ...post, likeCount: 0, likedByMe: false, replies: [] }, ...prev]);
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
          <PostItem
            key={post.id}
            post={post}
            isCreator={isCreator}
            currentUserId={currentUserId}
            canReply={canPost}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
