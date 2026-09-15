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
  const name = String(body?.name ?? '').trim();
  const description = String(body?.description ?? '').trim();
  const photoUrl = body?.photoUrl ? String(body.photoUrl).trim() : null;

  if (!name || name.length < 3 || name.length > 80) {
    return NextResponse.json({ error: 'O nome da comunidade deve ter de 3 a 80 caracteres.' }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: 'Escreva uma descrição para a comunidade.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_communities')
    .insert({ name, description, photo_url: photoUrl, creator_user_id: user.id })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Crie seu perfil antes de criar uma comunidade.' }, { status: 400 });
  }

  const { error: joinError } = await supabase
    .from('oldkut_community_members')
    .insert({ community_id: data.id, user_id: user.id });

  if (joinError) {
    return NextResponse.json({ error: 'Comunidade criada, mas não foi possível te adicionar como membro.' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? '');
  const name = String(body?.name ?? '').trim();
  const description = String(body?.description ?? '').trim();
  const photoUrl = body?.photoUrl ? String(body.photoUrl).trim() : null;

  if (!id) {
    return NextResponse.json({ error: 'Comunidade inválida.' }, { status: 400 });
  }
  if (!name || name.length < 3 || name.length > 80) {
    return NextResponse.json({ error: 'O nome da comunidade deve ter de 3 a 80 caracteres.' }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: 'Escreva uma descrição para a comunidade.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_communities')
    .update({ name, description, photo_url: photoUrl })
    .eq('id', id)
    .eq('creator_user_id', user.id)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Não foi possível salvar a comunidade.' }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}
