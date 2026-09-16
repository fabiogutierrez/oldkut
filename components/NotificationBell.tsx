'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/lib/notifications';

export default function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const removeFriendRequest = (userId: string) => {
    setNotifications((prev) => prev.filter((n) => !(n.type === 'friend_request' && n.userId === userId)));
  };

  const removeTestimonial = (id: string) => {
    setNotifications((prev) => prev.filter((n) => !(n.type === 'testimonial' && n.id === id)));
  };

  const handleAcceptFriend = async (requesterUserId: string) => {
    setBusyKey(requesterUserId);
    const res = await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterUserId }),
    });
    setBusyKey(null);
    if (!res.ok) return;
    removeFriendRequest(requesterUserId);
    router.refresh();
  };

  const handleRejectFriend = async (requesterUserId: string) => {
    setBusyKey(requesterUserId);
    const res = await fetch(`/api/friends?userId=${requesterUserId}`, { method: 'DELETE' });
    setBusyKey(null);
    if (!res.ok) return;
    removeFriendRequest(requesterUserId);
    router.refresh();
  };

  const handleApproveTestimonial = async (id: string) => {
    setBusyKey(id);
    const res = await fetch('/api/testimonials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setBusyKey(null);
    if (!res.ok) return;
    removeTestimonial(id);
    router.refresh();
  };

  const handleRejectTestimonial = async (id: string) => {
    setBusyKey(id);
    const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
    setBusyKey(null);
    if (!res.ok) return;
    removeTestimonial(id);
    router.refresh();
  };

  return (
    <div className="oldkut-notif" ref={panelRef}>
      <button type="button" className="oldkut-notif-btn" onClick={() => setOpen((v) => !v)} aria-label="Notificações">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {notifications.length > 0 && <span className="oldkut-notif-badge">{notifications.length}</span>}
      </button>

      {open && (
        <div className="oldkut-notif-panel">
          <div className="oldkut-box-title">Notificações</div>
          {notifications.length === 0 ? (
            <p className="oldkut-notif-empty">Nenhuma notificação.</p>
          ) : (
            <div className="oldkut-notif-list">
              {notifications.map((n) =>
                n.type === 'friend_request' ? (
                  <div key={`friend-${n.userId}`} className="oldkut-request-row">
                    {n.photoUrl ? (
                      <img src={n.photoUrl} alt={n.displayName} className="oldkut-request-avatar" />
                    ) : (
                      <div className="oldkut-request-avatar">{n.displayName?.[0]?.toUpperCase() ?? '?'}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={`/perfil/${n.username}`} className="oldkut-request-name" style={{ display: 'block' }}>
                        {n.displayName}
                      </a>
                      <span className="oldkut-notif-kind">quer ser seu amigo</span>
                    </div>
                    <div className="oldkut-request-actions">
                      <button
                        type="button"
                        className="oldkut-btn"
                        disabled={busyKey === n.userId}
                        onClick={() => handleAcceptFriend(n.userId)}
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        className="oldkut-btn"
                        disabled={busyKey === n.userId}
                        onClick={() => handleRejectFriend(n.userId)}
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={`testimonial-${n.id}`} className="oldkut-request-row">
                    {n.authorPhotoUrl ? (
                      <img src={n.authorPhotoUrl} alt={n.authorDisplayName} className="oldkut-request-avatar" />
                    ) : (
                      <div className="oldkut-request-avatar">{n.authorDisplayName?.[0]?.toUpperCase() ?? '?'}</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={`/perfil/${n.authorUsername}`} className="oldkut-request-name" style={{ display: 'block' }}>
                        {n.authorDisplayName}
                      </a>
                      <span className="oldkut-notif-kind">deixou um depoimento: &quot;{n.message}&quot;</span>
                    </div>
                    <div className="oldkut-request-actions">
                      <button
                        type="button"
                        className="oldkut-btn"
                        disabled={busyKey === n.id}
                        onClick={() => handleApproveTestimonial(n.id)}
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        className="oldkut-btn"
                        disabled={busyKey === n.id}
                        onClick={() => handleRejectTestimonial(n.id)}
                      >
                        Recusar
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
