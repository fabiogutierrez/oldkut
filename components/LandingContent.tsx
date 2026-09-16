'use client';

import Link from 'next/link';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const FEATURE_KEYS = [
  { icon: '👥', title: 'landing.feature1Title', desc: 'landing.feature1Desc' },
  { icon: '📝', title: 'landing.feature2Title', desc: 'landing.feature2Desc' },
  { icon: '🏘️', title: 'landing.feature3Title', desc: 'landing.feature3Desc' },
  { icon: '💬', title: 'landing.feature4Title', desc: 'landing.feature4Desc' },
  { icon: '💌', title: 'landing.feature5Title', desc: 'landing.feature5Desc' },
  { icon: '🔒', title: 'landing.feature6Title', desc: 'landing.feature6Desc' },
] as const;

export default function LandingContent() {
  const { t } = useLocale();

  return (
    <div className="oldkut-landing">
      <h1>{t('landing.title')}</h1>
      <p>{t('landing.subtitle')}</p>
      <Link href="/login" className="oldkut-landing-link">
        {t('landing.cta')}
      </Link>

      <h2 className="oldkut-landing-features-title">{t('landing.featuresTitle')}</h2>
      <div className="oldkut-feature-grid">
        {FEATURE_KEYS.map((f) => (
          <div key={f.title} className="oldkut-feature-card">
            <div className="oldkut-feature-icon">{f.icon}</div>
            <div className="oldkut-feature-title">{t(f.title)}</div>
            <div className="oldkut-feature-desc">{t(f.desc)}</div>
          </div>
        ))}
      </div>

      <p className="oldkut-landing-tagline">{t('landing.tagline')}</p>
    </div>
  );
}
