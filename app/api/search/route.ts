import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function sanitizeSearchTerm(input: string) {
  return input.replace(/[,()%_]/g, ' ').trim().slice(0, 80);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = sanitizeSearchTerm(searchParams.get('q') ?? '');

  if (!term) {
    return NextResponse.json({ people: [], communities: [] });
  }

  const supabase = await createClient();

  const [{ data: peopleRaw }, { data: communitiesRaw }] = await Promise.all([
    supabase
      .from('oldkut_profiles')
      .select('user_id, username, display_name, photo_url')
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
      .limit(8),
    supabase
      .from('oldkut_communities')
      .select('id, name, description, photo_url, is_private')
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .limit(8),
  ]);

  return NextResponse.json({
    people: peopleRaw ?? [],
    communities: communitiesRaw ?? [],
  });
}
