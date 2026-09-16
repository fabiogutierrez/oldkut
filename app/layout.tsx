import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import OldkutHeader from '@/components/OldkutHeader';
import type { Notification } from '@/lib/notifications';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { getLocale } from '@/lib/i18n/getLocale';
import { wordmarkFont } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'oldkut',
  description: 'Adicione amigos, deixe recados e relembre a época das comunidades.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RequesterProfile {
  user_id: string;
  username: string;
  display_name: string;
  photo_url: string | null;
}

interface TestimonialAuthorRow {
  id: string;
  message: string;
  author: { username: string; display_name: string; photo_url: string | null } | null;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const locale = await getLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let notifications: Notification[] = [];

  if (user) {
    const { data } = await supabase.from('oldkut_profiles').select('username').eq('user_id', user.id).maybeSingle();
    username = data?.username ?? null;

    if (username) {
      const [{ data: pendingFriendsRaw }, { data: pendingTestimonialsRaw }] = await Promise.all([
        supabase
          .from('oldkut_friendships')
          .select('requester:oldkut_profiles!oldkut_friendships_requester_user_id_fkey(user_id, username, display_name, photo_url)')
          .eq('addressee_user_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('oldkut_testimonials')
          .select('id, message, author:oldkut_profiles!oldkut_testimonials_author_user_id_fkey(username, display_name, photo_url)')
          .eq('profile_user_id', user.id)
          .eq('status', 'pending'),
      ]);

      const friendNotifications: Notification[] = ((pendingFriendsRaw as unknown as { requester: RequesterProfile | null }[] | null) ?? [])
        .map((r) => r.requester)
        .filter((r): r is RequesterProfile => r !== null)
        .map((r) => ({
          type: 'friend_request',
          userId: r.user_id,
          username: r.username,
          displayName: r.display_name,
          photoUrl: r.photo_url,
        }));

      const testimonialNotifications: Notification[] = ((pendingTestimonialsRaw as unknown as TestimonialAuthorRow[] | null) ?? [])
        .filter((t) => t.author !== null)
        .map((t) => ({
          type: 'testimonial',
          id: t.id,
          message: t.message,
          authorUsername: t.author!.username,
          authorDisplayName: t.author!.display_name,
          authorPhotoUrl: t.author!.photo_url,
        }));

      notifications = [...friendNotifications, ...testimonialNotifications];
    }
  }

  return (
    <html lang="pt-BR" className={wordmarkFont.variable}>
      <body>
        <LocaleProvider initialLocale={locale}>
          <div className="oldkut-shell">
            <OldkutHeader username={username} notifications={notifications} />
            <div className="oldkut-container">{children}</div>
            <div className="oldkut-footer">
              <Link href="/privacidade">Privacidade</Link>·<Link href="/termos">Termos de Serviço</Link>
            </div>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
