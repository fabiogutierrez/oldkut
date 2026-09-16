'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function DeleteAccountButton() {
  const router = useRouter();
  const { t } = useLocale();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/account', { method: 'DELETE' });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? t('account.deleteError'));
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>{t('account.deleteWarning')}</p>

      <div className="oldkut-checkbox-row" style={{ marginBottom: 10 }}>
        <input id="confirmDelete" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
        <label htmlFor="confirmDelete" style={{ margin: 0, fontWeight: 'normal', cursor: 'pointer', fontSize: 13 }}>
          {t('account.deleteConfirmLabel')}
        </label>
      </div>

      {error && <p className="oldkut-error">{error}</p>}

      <button type="button" className="oldkut-btn oldkut-btn-danger" disabled={!confirmed || submitting} onClick={handleDelete}>
        {submitting ? t('account.deleting') : t('account.deleteButton')}
      </button>
    </div>
  );
}
