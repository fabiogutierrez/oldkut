import { getLocale } from '@/lib/i18n/getLocale';
import { PRIVACY_CONTENT } from '@/lib/i18n/legalContent';

export const metadata = {
  title: 'Política de Privacidade — oldkut',
};

export default async function PrivacidadePage() {
  const locale = await getLocale();
  const content = PRIVACY_CONTENT[locale];

  return (
    <div className="oldkut-box">
      <div className="oldkut-box-title">{content.title}</div>
      <div className="oldkut-box-body oldkut-legal">
        <p>{content.intro}</p>

        {content.sections.map((section) => (
          <div key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
