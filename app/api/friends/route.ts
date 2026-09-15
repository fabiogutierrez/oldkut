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
  const targetUserId = String(body?.targetUserId ?? '');

  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: 'Usuário inválido.' }, { status: 400 });
  }

  const { data: reverse } = await supabase
    .from('oldkut_friendships')
    .select('id, status')
    .eq('requester_user_id', targetUserId)
    .eq('addressee_user_id', user.id)
    .maybeSingle();

  if (reverse) {
    if (reverse.status === 'pending') {
      const { error } = await supabase.from('oldkut_friendships').update({ status: 'accepted' }).eq('id', reverse.id);
      if (error) {
        return NextResponse.json({ error: 'Não foi possível aceitar o pedido.' }, { status: 400 });
      }
    }
    return NextResponse.json({ status: 'accepted' });
  }

  const { error } = await supabase
    .from('oldkut_friendships')
    .insert({ requester_user_id: user.id, addressee_user_id: targetUserId });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ status: 'pending' });
    }
    return NextResponse.json({ error: 'Crie seu perfil antes de adicionar amigos.' }, { status: 400 });
  }

  return NextResponse.json({ status: 'pending' });
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
  const requesterUserId = String(body?.requesterUserId ?? '');

  if (!requesterUserId) {
    return NextResponse.json({ error: 'Usuário inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_friendships')
    .update({ status: 'accepted' })
    .eq('requester_user_id', requesterUserId)
    .eq('addressee_user_id', user.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Não foi possível aceitar o pedido.' }, { status: 400 });
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
  const otherUserId = searchParams.get('userId');

  if (!otherUserId) {
    return NextResponse.json({ error: 'Usuário inválido.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('oldkut_friendships')
    .delete()
    .or(
      `and(requester_user_id.eq.${user.id},addressee_user_id.eq.${otherUserId}),and(requester_user_id.eq.${otherUserId},addressee_user_id.eq.${user.id})`
    );

  if (error) {
    return NextResponse.json({ error: 'Não foi possível remover.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
