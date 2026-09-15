interface Community {
  id: string;
  name: string;
  photoUrl: string | null;
}

export default function ProfileCommunities({ communities }: { communities: Community[] }) {
  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">Comunidades{communities.length > 0 ? ` (${communities.length})` : ''}</div>
      <div className="oldkut-box-body">
        {communities.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Nenhuma comunidade ainda.</p>}
        <div className="oldkut-friend-grid">
          {communities.map((c) => (
            <a key={c.id} href={`/comunidades/${c.id}`} className="oldkut-friend-item">
              {c.photoUrl ? (
                <img src={c.photoUrl} alt={c.name} className="oldkut-friend-avatar" />
              ) : (
                <div className="oldkut-friend-avatar">{c.name?.[0]?.toUpperCase() ?? '?'}</div>
              )}
              <div className="oldkut-friend-name">{c.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
