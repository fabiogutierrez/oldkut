interface Friend {
  userId: string;
  username: string;
  displayName: string;
  photoUrl: string | null;
}

export default function FriendsList({ friends }: { friends: Friend[] }) {
  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">Amigos{friends.length > 0 ? ` (${friends.length})` : ''}</div>
      <div className="oldkut-box-body">
        {friends.length === 0 && <p style={{ fontSize: 13, color: '#777' }}>Nenhum amigo ainda.</p>}
        <div className="oldkut-friend-grid">
          {friends.map((f) => (
            <a key={f.userId} href={`/perfil/${f.username}`} className="oldkut-friend-item">
              {f.photoUrl ? (
                <img src={f.photoUrl} alt={f.displayName} className="oldkut-friend-avatar" />
              ) : (
                <div className="oldkut-friend-avatar">{f.displayName?.[0]?.toUpperCase() ?? '?'}</div>
              )}
              <div className="oldkut-friend-name">{f.displayName}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
