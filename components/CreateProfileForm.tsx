'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function CreateProfileForm({ defaultName }: { defaultName?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(defaultName ?? '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setError('O nome de usuário deve ter de 3 a 20 letras minúsculas, números ou "_".');
      return;
    }
    if (!displayName.trim()) {
      setError('Informe seu nome.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cleanUsername,
        displayName: displayName.trim(),
        photoUrl: photoUrl.trim() || null,
        city: city.trim() || null,
        birthday: birthday || null,
        bio: bio.trim() || null,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'Não foi possível criar o perfil.');
      return;
    }

    router.push(`/perfil/${cleanUsername}`);
    router.refresh();
  };

  return (
    <form className="oldkut-form" onSubmit={handleSubmit}>
      <label htmlFor="username">Nome de usuário (vai aparecer na URL do seu perfil)</label>
      <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: joaosilva" />
      <p className="oldkut-hint">Só letras minúsculas, números e &quot;_&quot; — de 3 a 20 caracteres.</p>

      <label htmlFor="displayName">Nome</label>
      <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu nome" />

      <label htmlFor="photoUrl">URL da foto (opcional)</label>
      <input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />

      <label htmlFor="city">Cidade</label>
      <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />

      <label htmlFor="birthday">Aniversário</label>
      <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />

      <label htmlFor="bio">Sobre mim</label>
      <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale um pouco sobre você..." />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar perfil'}
        </button>
      </div>
    </form>
  );
}
