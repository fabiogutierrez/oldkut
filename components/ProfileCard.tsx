interface OldkutProfile {
  display_name: string;
  username: string;
  photo_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  birthday: string | null;
}

function formatBirthday(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

export default function ProfileCard({ profile }: { profile: OldkutProfile }) {
  const initial = profile.display_name?.[0]?.toUpperCase() ?? '?';
  const location = [profile.city, profile.country].filter(Boolean).join(', ');

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-body">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={profile.display_name} className="oldkut-avatar" />
        ) : (
          <div className="oldkut-avatar">{initial}</div>
        )}
        <div className="oldkut-profile-name">{profile.display_name}</div>
        <div className="oldkut-profile-meta">
          @{profile.username}
          {location && (
            <>
              <br />
              {location}
            </>
          )}
          {profile.birthday && (
            <>
              <br />
              {formatBirthday(profile.birthday)}
            </>
          )}
        </div>
        {profile.bio && <p style={{ fontSize: 12, marginTop: 10, color: '#444' }}>{profile.bio}</p>}
      </div>
    </div>
  );
}
