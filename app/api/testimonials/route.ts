import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TestimonialAuthor {
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
  const profileUserId = String(body?.profileUserId ?? '');
  const message = String(body?.message ?? '').trim();

  if (!profileUserId || !message) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  if (profileUserId === user.id) {
    return NextResponse.json({ error: 'Você não pode escrever um depoimento pra si mesmo.' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Depoimento muito longo.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_testimonials')
    .insert({ profile_user_id: profileUserId, author_user_id: user.id, message })
    .select(
      'id, message, status, created_at, author_user_id, author:oldkut_profiles!oldkut_testimonials_author_user_id_fkey(username, display_name, photo_url)'
    )
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Crie seu perfil antes de deixar um depoimento.' }, { status: 400 });
  }

  const author = data.author as unknown as TestimonialAuthor | null;

  return NextResponse.json({
    testimonial: {
      id: data.id,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
      authorUserId: data.author_user_id,
      authorUsername: author?.username ?? '',
      authorDisplayName: author?.display_name ?? '?',
      authorPhotoUrl: author?.photo_url ?? null,
    },
  });
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

  if (!id) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('oldkut_testimonials')
    .update({ status: 'approved' })
    .eq('id', id)
    .eq('profile_user_id', user.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Não foi possível aprovar.' }, { status: 400 });
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
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  const { error } = await supabase.from('oldkut_testimonials').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Não foi possível excluir.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
