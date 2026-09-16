'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isAtLeast18 } from '@/lib/age';
import { COUNTRIES } from '@/lib/countries';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get('error');
  const { t } = useLocale();

  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(authError ? t('auth.errorAuth') : null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError(t('auth.errorFillFields'));
      return;
    }

    if (mode === 'signup') {
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
    }

    setSubmitting(true);

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { birthday, country } },
      });
      setSubmitting(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setNotice(t('auth.signupSuccess'));
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setSubmitting(false);

    if (signInError) {
      setError(t('auth.errorInvalid'));
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t('auth.errorForgotEmail'));
      return;
    }

    setForgotSubmitting(true);
    await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });
    setForgotSubmitting(false);
    setNotice(t('auth.forgotSuccess'));
  };

  return (
    <div className="oldkut-box" style={{ maxWidth: 380, margin: '30px auto' }}>
      <div className="oldkut-box-title">{mode === 'signup' ? t('auth.signup') : t('auth.login')}</div>
      <div className="oldkut-box-body">
        <button type="button" className="oldkut-btn oldkut-google-btn" onClick={handleGoogle}>
          {t('auth.google')}
        </button>
        <div className="oldkut-divider">{t('auth.or')}</div>

        <div className="oldkut-tabs">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>
            {t('auth.login')}
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            {t('auth.signup')}
          </button>
        </div>

        <form className="oldkut-form" onSubmit={handleSubmit}>
          <label htmlFor="email">{t('auth.email')}</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />

          <label htmlFor="password">{t('auth.password')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? t('auth.passwordPlaceholderSignup') : t('auth.passwordPlaceholderSignin')}
          />

          {mode === 'signin' && (
            <button
              type="button"
              className="oldkut-link-btn"
              style={{ marginTop: 6 }}
              disabled={forgotSubmitting}
              onClick={handleForgotPassword}
            >
              {forgotSubmitting ? t('auth.submitting') : t('auth.forgotPassword')}
            </button>
          )}

          {mode === 'signup' && (
            <>
              <label htmlFor="birthday">{t('auth.birthday')}</label>
              <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              <p className="oldkut-hint">{t('auth.ageHint')}</p>

              <label htmlFor="country">{t('auth.country')}</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">{t('auth.selectCountry')}</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </>
          )}

          {error && <p className="oldkut-error">{error}</p>}
          {notice && <p className="oldkut-notice">{notice}</p>}

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="oldkut-btn" disabled={submitting}>
              {submitting ? t('auth.submitting') : mode === 'signup' ? t('auth.submitSignup') : t('auth.submitSignin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
