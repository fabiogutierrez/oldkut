'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const { t } = useLocale();

  const [supabase] = useState(() => createClient());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 6) {
      setError(t('auth.errorPasswordShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'));
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(t('auth.errorAuth'));
      return;
    }

    setNotice(t('auth.resetSuccess'));
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1500);
  };

  return (
    <div className="oldkut-box" style={{ maxWidth: 380, margin: '30px auto' }}>
      <div className="oldkut-box-title">{t('auth.resetTitle')}</div>
      <div className="oldkut-box-body">
        <form className="oldkut-form" onSubmit={handleSubmit}>
          <label htmlFor="password">{t('auth.newPassword')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.newPasswordPlaceholder')}
          />

          <label htmlFor="confirmPassword">{t('auth.newPasswordConfirm')}</label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          {error && <p className="oldkut-error">{error}</p>}
          {notice && <p className="oldkut-notice">{notice}</p>}

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="oldkut-btn" disabled={submitting}>
              {submitting ? t('auth.submitting') : t('auth.resetSubmit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
