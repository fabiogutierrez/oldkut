'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PendingRequest {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function NotificationBell({ initialRequests }: { initialRequests: PendingRequest[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [open, setOpen] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

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

  const handleAccept = async (requesterUserId: string) => {
    setBusyUserId(requesterUserId);
    const res = await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterUserId }),
    });
    setBusyUserId(null);
    if (!res.ok) return;
    setRequests((prev) => prev.filter((r) => r.userId !== requesterUserId));
    router.refresh();
  };

  const handleReject = async (requesterUserId: string) => {
    setBusyUserId(requesterUserId);
    const res = await fetch(`/api/friends?userId=${requesterUserId}`, { method: 'DELETE' });
    setBusyUserId(null);
    if (!res.ok) return;
    setRequests((prev) => prev.filter((r) => r.userId !== requesterUserId));
    router.refresh();
  };

  return (
    <div className="oldkut-notif" ref={panelRef}>
      <button type="button" className="oldkut-notif-btn" onClick={() => setOpen((v) => !v)} aria-label="Notificações">
        🔔
        {requests.length > 0 && <span className="oldkut-notif-badge">{requests.length}</span>}
      </button>

      {open && (
        <div className="oldkut-notif-panel">
          <div className="oldkut-box-title">Pedidos de amizade</div>
          {requests.length === 0 ? (
            <p className="oldkut-notif-empty">Nenhuma notificação.</p>
          ) : (
            <div className="oldkut-notif-list">
              {requests.map((r) => (
                <div key={r.userId} className="oldkut-request-row">
                  {r.photoUrl ? (
                    <img src={r.photoUrl} alt={r.displayName} className="oldkut-request-avatar" />
                  ) : (
                    <div className="oldkut-request-avatar">{r.displayName?.[0]?.toUpperCase() ?? '?'}</div>
                  )}
                  <a href={`/perfil/${r.username}`} className="oldkut-request-name">
                    {r.displayName}
                  </a>
                  <div className="oldkut-request-actions">
                    <button
                      type="button"
                      className="oldkut-btn"
                      disabled={busyUserId === r.userId}
                      onClick={() => handleAccept(r.userId)}
                    >
                      Aceitar
                    </button>
                    <button
                      type="button"
                      className="oldkut-btn"
                      disabled={busyUserId === r.userId}
                      onClick={() => handleReject(r.userId)}
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
