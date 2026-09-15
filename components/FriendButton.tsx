'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'accepted';

export default function FriendButton({ targetUserId, initialStatus }: { targetUserId: string; initialStatus: FriendStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    setSubmitting(true);
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    const { status: newStatus } = await res.json();
    setStatus(newStatus === 'accepted' ? 'accepted' : 'pending_sent');
    router.refresh();
  };

  const handleAccept = async () => {
    setSubmitting(true);
    const res = await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterUserId: targetUserId }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    setStatus('accepted');
    router.refresh();
  };

  const handleRemove = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/friends?userId=${targetUserId}`, { method: 'DELETE' });
    setSubmitting(false);
    if (!res.ok) return;
    setStatus('none');
    router.refresh();
  };

  if (status === 'accepted') {
    return (
      <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleRemove}>
        Amigos — desfazer
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleRemove}>
        Pedido enviado — cancelar
      </button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleAccept}>
          Aceitar
        </button>
        <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleRemove}>
          Recusar
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleAdd}>
      Adicionar amigo
    </button>
  );
}
