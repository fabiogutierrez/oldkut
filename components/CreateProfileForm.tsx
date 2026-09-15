'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isAtLeast18 } from '@/lib/age';
import { COUNTRIES } from '@/lib/countries';
import { createClient } from '@/lib/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

export default function CreateProfileForm({
  userId,
  defaultName,
  defaultBirthday,
  defaultCountry,
}: {
  userId: string;
  defaultName?: string;
  defaultBirthday?: string;
  defaultCountry?: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [displayName, setDisplayName] = useState(defaultName ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(defaultCountry ?? '');
  const [birthday, setBirthday] = useState(defaultBirthday ?? '');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setUsernameStatus('idle');
      return;
    }
    if (!USERNAME_RE.test(cleanUsername)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    let cancelled = false;

    const timer = setTimeout(async () => {
      const { data } = await supabase.from('oldkut_profiles').select('user_id').eq('username', cleanUsername).maybeSingle();
      if (!cancelled) {
        setUsernameStatus(data ? 'taken' : 'available');
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setError('O nome de usuário deve ter de 3 a 20 letras minúsculas, números ou "_".');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('Esse nome de usuário já está em uso.');
      return;
    }
    if (usernameStatus === 'checking') {
      setError('Aguarde a verificação do nome de usuário.');
      return;
    }
    if (!displayName.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (!birthday) {
      setError('Informe sua data de nascimento.');
      return;
    }
    if (!isAtLeast18(birthday)) {
      setError('Você precisa ter 18 anos ou mais para usar o oldkut.');
      return;
    }
    if (!country) {
      setError('Selecione o seu país.');
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cleanUsername,
        displayName: displayName.trim(),
        photoUrl,
        city: city.trim() || null,
        country,
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
      {usernameStatus === 'checking' && <p className="oldkut-hint">Verificando...</p>}
      {usernameStatus === 'available' && <p className="oldkut-notice">✓ Nome de usuário disponível.</p>}
      {usernameStatus === 'taken' && <p className="oldkut-error">Esse nome de usuário já está em uso.</p>}
      {usernameStatus === 'invalid' && username.trim() && <p className="oldkut-error">Formato inválido.</p>}

      <label htmlFor="displayName">Nome</label>
      <input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu nome" />

      <label>Foto do perfil</label>
      <AvatarUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />

      <label htmlFor="city">Cidade</label>
      <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />

      <label htmlFor="country">País</label>
      <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">Selecione...</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label htmlFor="birthday">Data de nascimento</label>
      <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <p className="oldkut-hint">É preciso ter 18 anos ou mais pra usar o oldkut.</p>

      <label htmlFor="bio">Sobre mim</label>
      <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Fale um pouco sobre você..." />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting || usernameStatus === 'checking' || usernameStatus === 'taken'}>
          {submitting ? 'Criando...' : 'Criar perfil'}
        </button>
      </div>
    </form>
  );
}
