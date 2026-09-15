import FriendButton from '@/components/FriendButton';

interface PendingRequest {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function FriendRequests({ requests }: { requests: PendingRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">Pedidos de amizade ({requests.length})</div>
      <div className="oldkut-box-body">
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
            <FriendButton targetUserId={r.userId} initialStatus="pending_received" />
          </div>
        ))}
      </div>
    </div>
  );
}
