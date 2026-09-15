import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const communityId = String(body?.communityId ?? '');

  if (!communityId) {
    return NextResponse.json({ error: 'Comunidade inválida.' }, { status: 400 });
  }

  const { error } = await supabase.from('oldkut_community_members').insert({ community_id: communityId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Crie seu perfil antes de entrar em uma comunidade.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const communityId = searchParams.get('communityId');

  if (!communityId) {
    return NextResponse.json({ error: 'Comunidade inválida.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('oldkut_community_members')
    .delete()
    .eq('community_id', communityId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Não foi possível sair da comunidade.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
