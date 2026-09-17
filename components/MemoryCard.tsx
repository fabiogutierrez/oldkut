'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

interface Memory {
  message: string;
  authorDisplayName: string;
  authorUsername: string;
  yearsAgo: number;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const { t } = useLocale();
  const yearUnit = memory.yearsAgo === 1 ? t('memory.yearSingular') : t('memory.yearPlural');

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">📼 {t('memory.title')}</div>
      <div className="oldkut-box-body">
        <p className="oldkut-hint" style={{ marginBottom: 8 }}>
          {t('memory.prefix')}
          {memory.yearsAgo} {yearUnit}
          {t('memory.suffix')}
        </p>
        <div className="oldkut-scrap">
          <div style={{ flex: 1 }}>
            <a href={`/perfil/${memory.authorUsername}`} className="oldkut-scrap-author">
              {memory.authorDisplayName}
            </a>
            <div className="oldkut-scrap-message" style={{ fontStyle: 'italic' }}>
              &quot;{memory.message}&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
