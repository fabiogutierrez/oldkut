'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AvatarUpload from '@/components/AvatarUpload';

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
  const [name, setName] = useState(defaultName ?? '');
  const [description, setDescription] = useState(defaultDescription ?? '');
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultPhotoUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('O nome da comunidade deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!description.trim()) {
      setError('Escreva uma descrição para a comunidade.');
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
      setError(body?.error ?? 'Não foi possível salvar a comunidade.');
      return;
    }

    const { id } = await res.json();
    router.push(`/comunidades/${id}`);
    router.refresh();
  };

  return (
    <form className="oldkut-form" onSubmit={handleSubmit}>
      <label htmlFor="name">Nome da comunidade</label>
      <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Eu odeio acordar cedo" />

      <label htmlFor="description">Descrição</label>
      <textarea
        id="description"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Do que se trata essa comunidade?"
      />

      <label>Foto da comunidade</label>
      <AvatarUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting}>
          {submitting ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Criar comunidade'}
        </button>
      </div>
    </form>
  );
}
