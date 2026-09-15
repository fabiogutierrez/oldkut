'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { isAtLeast18 } from '@/lib/age';
import { COUNTRIES } from '@/lib/countries';
import { createClient } from '@/lib/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

export default function CreateProfileForm({
  userId,
  mode = 'create',
  defaultUsername,
  defaultName,
  defaultPhotoUrl,
  defaultCity,
  defaultBirthday,
  defaultCountry,
  defaultBio,
}: {
  userId: string;
  mode?: 'create' | 'edit';
  defaultUsername?: string;
  defaultName?: string;
  defaultPhotoUrl?: string | null;
  defaultCity?: string;
  defaultBirthday?: string;
  defaultCountry?: string;
  defaultBio?: string;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [supabase] = useState(() => createClient());
  const [username, setUsername] = useState(defaultUsername ?? '');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [displayName, setDisplayName] = useState(defaultName ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultPhotoUrl ?? null);
  const [city, setCity] = useState(defaultCity ?? '');
  const [country, setCountry] = useState(defaultCountry ?? '');
  const [birthday, setBirthday] = useState(defaultBirthday ?? '');
  const [bio, setBio] = useState(defaultBio ?? '');
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
    if (mode === 'edit' && cleanUsername === (defaultUsername ?? '').toLowerCase()) {
      setUsernameStatus('idle');
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
  }, [username, supabase, mode, defaultUsername]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(cleanUsername)) {
      setError(t('profile.errorUsername'));
      return;
    }
    if (usernameStatus === 'taken') {
      setError(t('profile.errorUsernameTaken'));
      return;
    }
    if (usernameStatus === 'checking') {
      setError(t('profile.errorUsernameChecking'));
      return;
    }
    if (!displayName.trim()) {
      setError(t('profile.errorName'));
      return;
    }
    if (!birthday) {
      setError(t('auth.errorBirthday'));
      return;
    }
    if (!isAtLeast18(birthday)) {
      setError(t('auth.errorAge'));
      return;
    }
    if (!country) {
      setError(t('auth.errorCountry'));
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
      setError(body?.error ?? t('profile.errorUsername'));
      return;
    }

    router.push(`/perfil/${cleanUsername}`);
    router.refresh();
  };

  return (
    <form className="oldkut-form" onSubmit={handleSubmit}>
      <label htmlFor="username">{t('profile.usernameLabel')}</label>
      <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex: joaosilva" />
      <p className="oldkut-hint">{t('profile.usernameHint')}</p>
      {usernameStatus === 'checking' && <p className="oldkut-hint">{t('profile.usernameChecking')}</p>}
      {usernameStatus === 'available' && <p className="oldkut-notice">{t('profile.usernameAvailable')}</p>}
      {usernameStatus === 'taken' && <p className="oldkut-error">{t('profile.usernameTaken')}</p>}
      {usernameStatus === 'invalid' && username.trim() && <p className="oldkut-error">{t('profile.usernameInvalid')}</p>}

      <label htmlFor="displayName">{t('profile.nameLabel')}</label>
      <input
        id="displayName"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder={t('profile.namePlaceholder')}
      />

      <label>{t('profile.photoLabel')}</label>
      <AvatarUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />

      <label htmlFor="city">{t('profile.cityLabel')}</label>
      <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('profile.cityPlaceholder')} />

      <label htmlFor="country">{t('auth.country')}</label>
      <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">{t('auth.selectCountry')}</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label htmlFor="birthday">{t('auth.birthday')}</label>
      <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      <p className="oldkut-hint">{t('auth.ageHint')}</p>

      <label htmlFor="bio">{t('profile.bioLabel')}</label>
      <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('profile.bioPlaceholder')} />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting || usernameStatus === 'checking' || usernameStatus === 'taken'}>
          {submitting ? t('profile.saving') : mode === 'edit' ? t('profile.submitEdit') : t('profile.submitCreate')}
        </button>
      </div>
    </form>
  );
}
