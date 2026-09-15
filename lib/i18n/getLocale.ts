import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, type Locale } from './translations';

const VALID_LOCALES: Locale[] = ['pt', 'en', 'es'];

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get('oldkut_locale')?.value;
  return VALID_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
