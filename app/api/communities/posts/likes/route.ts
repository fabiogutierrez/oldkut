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
  const postId = String(body?.postId ?? '');
  if (!postId) {
    return NextResponse.json({ error: 'Publicação inválida.' }, { status: 400 });
  }

  const { error } = await supabase.from('oldkut_community_post_likes').insert({ post_id: postId, user_id: user.id });
  if (error) {
    return NextResponse.json({ error: 'Não foi possível curtir.' }, { status: 400 });
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
  const postId = searchParams.get('postId');
  if (!postId) {
    return NextResponse.json({ error: 'Publicação inválida.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('oldkut_community_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Não foi possível descurtir.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
