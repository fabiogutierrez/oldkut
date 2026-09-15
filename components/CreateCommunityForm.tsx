'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCommunityForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        description: description.trim(),
        photoUrl: photoUrl.trim() || null,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? 'Não foi possível criar a comunidade.');
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

      <label htmlFor="photoUrl">URL da foto (opcional)</label>
      <input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />

      {error && <p className="oldkut-error">{error}</p>}

      <div style={{ marginTop: 12 }}>
        <button type="submit" className="oldkut-btn" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar comunidade'}
        </button>
      </div>
    </form>
  );
}
