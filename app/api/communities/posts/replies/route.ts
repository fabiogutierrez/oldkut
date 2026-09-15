import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ReplyAuthor {
  username: string | null;
  display_name: string | null;
  photo_url: string | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const postId = String(body?.postId ?? '');
  const message = String(body?.message ?? '').trim();

  if (!postId || !message) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  if (message.length > 1000) {
    return NextResponse.json({ error: 'Resposta muito longa.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_community_post_replies')
    .insert({ post_id: postId, author_user_id: user.id, message })
    .select(
      'id, message, created_at, author_user_id, author:oldkut_profiles!oldkut_community_post_replies_author_user_id_fkey(username, display_name, photo_url)'
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Participe da comunidade antes de responder.' }, { status: 400 });
  }

  const author = data.author as unknown as ReplyAuthor | null;

  return NextResponse.json({
    reply: {
      id: data.id,
      message: data.message,
      createdAt: data.created_at,
      authorUserId: data.author_user_id,
      authorUsername: author?.username ?? '',
      authorDisplayName: author?.display_name ?? '?',
      authorPhotoUrl: author?.photo_url ?? null,
    },
  });
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
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const { error } = await supabase.from('oldkut_community_post_replies').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
