import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAtLeast18 } from '@/lib/age';
import { COUNTRIES } from '@/lib/countries';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;
const COUNTRY_SET = new Set<string>(COUNTRIES);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const username = String(body?.username ?? '').trim().toLowerCase();
  const displayName = String(body?.displayName ?? '').trim();
  const birthday = String(body?.birthday ?? '');
  const country = String(body?.country ?? '');

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json({ error: 'Nome de usuário inválido.' }, { status: 400 });
  }
  if (!displayName) {
    return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 });
  }
  if (!birthday || !isAtLeast18(birthday)) {
    return NextResponse.json({ error: 'Você precisa ter 18 anos ou mais para usar o oldkut.' }, { status: 400 });
  }
  if (!COUNTRY_SET.has(country)) {
    return NextResponse.json({ error: 'Selecione um país válido.' }, { status: 400 });
  }

  const { error } = await supabase.from('oldkut_profiles').upsert({
    user_id: user.id,
    username,
    display_name: displayName,
    photo_url: body?.photoUrl ?? null,
    city: body?.city ?? null,
    country,
    birthday,
    bio: body?.bio ?? null,
    is_private: Boolean(body?.isPrivate),
    hide_visits: Boolean(body?.hideVisits),
  });

  if (error) {
    const message = error.code === '23505' ? 'Esse nome de usuário já está em uso.' : 'Não foi possível salvar o perfil.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
