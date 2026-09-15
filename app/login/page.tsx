'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isAtLeast18 } from '@/lib/age';
import { COUNTRIES } from '@/lib/countries';

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

  const [supabase] = useState(() => createClient());
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(authError ? 'Não foi possível confirmar seu login. Tente de novo.' : null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    if (mode === 'signup') {
      if (!birthday) {
        setError('Informe sua data de nascimento.');
        return;
      }
      if (!isAtLeast18(birthday)) {
        setError('Você precisa ter 18 anos ou mais para criar uma conta no oldkut.');
        return;
      }
      if (!country) {
        setError('Selecione o seu país.');
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

      setNotice('Conta criada! Verifique seu e-mail pra confirmar o cadastro antes de entrar.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setSubmitting(false);

    if (signInError) {
      setError('E-mail ou senha inválidos.');
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div className="oldkut-box" style={{ maxWidth: 380, margin: '30px auto' }}>
      <div className="oldkut-box-title">{mode === 'signup' ? 'Criar conta' : 'Entrar'}</div>
      <div className="oldkut-box-body">
        <div className="oldkut-tabs">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>
            Entrar
          </button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Criar conta
          </button>
        </div>

        <form className="oldkut-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />

          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'Crie uma senha' : 'Sua senha'}
          />

          {mode === 'signup' && (
            <>
              <label htmlFor="birthday">Data de nascimento</label>
              <input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              <p className="oldkut-hint">É preciso ter 18 anos ou mais pra usar o oldkut.</p>

              <label htmlFor="country">País</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Selecione...</option>
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
              {submitting ? 'Aguarde...' : mode === 'signup' ? 'Criar conta' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
