'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/AvatarUpload';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function CreateCommunityForm({
  userId,
  mode = 'create',
  communityId,
  defaultName,
  defaultDescription,
  defaultPhotoUrl,
}: {
  userId: string;
  mode?: 'create' | 'edit';
  communityId?: string;
  defaultName?: string;
  defaultDescription?: string;
  defaultPhotoUrl?: string | null;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const [name, setName] = useState(defaultName ?? '');
  const [description, setDescription] = useState(defaultDescription ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultPhotoUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError(t('community.errorName'));
      return;
    }
    if (!description.trim()) {
      setError(t('community.errorDescription'));
      return;
    }

    setSubmitting(true);
    const res = await fetch('/api/communities', {
      method: mode === 'edit' ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: communityId,
        name: name.trim(),
        description: description.trim(),
        photoUrl,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? t('community.errorName'));
      return;
    }

    const { id } = await res.json();
    router.push(`/comunidades/${id}`);
    router.refresh();
  };

  return (
    <form className="oldkut-form" onSubmit={handleSubmit}>
      <label htmlFor="name">{t('community.nameLabel')}</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('community.namePlaceholder')} />

      <label htmlFor="description">{t('community.descriptionLabel')}</label>
      <textarea
        id="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('community.descriptionPlaceholder')}
      />

      <label>{t('community.photoLabel')}</label>
      <AvatarUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting}>
          {submitting ? t('profile.saving') : mode === 'edit' ? t('community.submitEdit') : t('community.submitCreate')}
        </button>
      </div>
    </form>
  );
}
