'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

export default function LandingContent() {
  const { t } = useLocale();

  return (
    <div className="oldkut-landing">
      <h1>{t('landing.title')}</h1>
      <p>{t('landing.subtitle')}</p>
      <Link href="/login" className="oldkut-landing-link">
        {t('landing.cta')}
      </Link>
      <p className="oldkut-hint" style={{ marginTop: 16 }}>
        {t('landing.ageNotice')}
      </p>
    </div>
  );
}
