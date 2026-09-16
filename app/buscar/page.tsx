import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/lib/i18n/getLocale';
import { translate } from '@/lib/i18n/translations';

export const metadata = {
  title: 'Buscar — oldkut',
};

interface PersonResult {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

interface CommunityResult {
  id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  is_private: boolean;
}

function sanitizeSearchTerm(input: string) {
  return input.replace(/[,()%_]/g, ' ').trim().slice(0, 80);
}

export default async function BuscarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const rawQuery = (q ?? '').trim();
  const term = sanitizeSearchTerm(rawQuery);
  const supabase = await createClient();
  const locale = await getLocale();

  let people: PersonResult[] = [];
  let communities: CommunityResult[] = [];

  if (term) {
    const [{ data: peopleRaw }, { data: communitiesRaw }] = await Promise.all([
      supabase
        .from('oldkut_profiles')
        .select('user_id, username, display_name, photo_url')
        .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
        .limit(30),
      supabase
        .from('oldkut_communities')
        .select('id, name, description, photo_url, is_private')
        .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
        .limit(30),
    ]);

    people = (peopleRaw as PersonResult[] | null) ?? [];
    communities = (communitiesRaw as CommunityResult[] | null) ?? [];
  }

  const hasResults = people.length > 0 || communities.length > 0;

  return (
    <div>
      <div className="oldkut-box">
        <div className="oldkut-box-title">{translate(locale, 'search.title')}</div>
        <div className="oldkut-box-body">
          <form action="/buscar" method="GET" style={{ display: 'flex', gap: 8 }}>
            <input
              name="q"
              defaultValue={rawQuery}
              placeholder={translate(locale, 'search.placeholder')}
              style={{
                flex: 1,
                fontFamily: 'inherit',
                fontSize: 13,
                padding: '6px 8px',
                border: '1px solid #a4bade',
                borderRadius: 3,
                boxSizing: 'border-box',
              }}
            />
            <button type="submit" className="oldkut-btn">
              {translate(locale, 'search.submit')}
            </button>
          </form>
        </div>
      </div>

      {!rawQuery && (
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginTop: 20 }}>{translate(locale, 'search.prompt')}</p>
      )}

      {rawQuery && !hasResults && (
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', marginTop: 20 }}>{translate(locale, 'search.noResults')}</p>
      )}

      {people.length > 0 && (
        <div className="oldkut-box">
          <div className="oldkut-box-title">
            {translate(locale, 'search.peopleTitle')} ({people.length})
          </div>
          <div className="oldkut-box-body">
            {people.map((p) => (
              <a key={p.user_id} href={`/perfil/${p.username}`} className="oldkut-community-row">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.display_name} className="oldkut-community-avatar" loading="lazy" />
                ) : (
                  <div className="oldkut-community-avatar">{p.display_name?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="oldkut-community-name">{p.display_name}</div>
                  <div className="oldkut-community-desc">@{p.username}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {communities.length > 0 && (
        <div className="oldkut-box">
          <div className="oldkut-box-title">
            {translate(locale, 'search.communitiesTitle')} ({communities.length})
          </div>
          <div className="oldkut-box-body">
            {communities.map((c) => (
              <a key={c.id} href={`/comunidades/${c.id}`} className="oldkut-community-row">
                {c.photo_url ? (
                  <img src={c.photo_url} alt={c.name} className="oldkut-community-avatar" loading="lazy" />
                ) : (
                  <div className="oldkut-community-avatar">{c.name?.[0]?.toUpperCase() ?? '?'}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="oldkut-community-name">
                    {c.name}
                    {c.is_private && ' 🔒'}
                  </div>
                  <div className="oldkut-community-desc">{c.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
