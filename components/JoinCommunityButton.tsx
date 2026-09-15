'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinCommunityButton({
  communityId,
  initialIsMember,
}: {
  communityId: string;
  initialIsMember: boolean;
}) {
  const router = useRouter();
  const [isMember, setIsMember] = useState(initialIsMember);
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    setSubmitting(true);
    const res = await fetch('/api/communities/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ communityId }),
    });
    setSubmitting(false);
    if (!res.ok) return;
    setIsMember(true);
    router.refresh();
  };

  const handleLeave = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/communities/members?communityId=${communityId}`, { method: 'DELETE' });
    setSubmitting(false);
    if (!res.ok) return;
    setIsMember(false);
    router.refresh();
  };

  if (isMember) {
    return (
      <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleLeave}>
        Sair da comunidade
      </button>
    );
  }

  return (
    <button type="button" className="oldkut-btn" disabled={submitting} onClick={handleJoin}>
      Participar
    </button>
  );
}
