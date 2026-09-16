'use client';

import { useState, type ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const MAX_SIZE = 5 * 1024 * 1024;

export default function AvatarUpload({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const { t } = useLocale();
  const [supabase] = useState(() => createClient());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError(t('avatar.errorType'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t('avatar.errorSize'));
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    setUploading(false);

    if (uploadError) {
      setError(t('avatar.errorUpload'));
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    onChange(data.publicUrl);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {value ? (
          <img src={value} alt={t('profile.photoLabel')} className="oldkut-avatar" style={{ width: 72, height: 72, fontSize: 24 }} />
        ) : (
          <div className="oldkut-avatar" style={{ width: 72, height: 72, fontSize: 24 }}>
            ?
          </div>
        )}
        <div>
          <label className="oldkut-btn" style={{ display: 'inline-block', cursor: uploading ? 'default' : 'pointer' }}>
            {uploading ? t('avatar.uploading') : value ? t('avatar.change') : t('avatar.choose')}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          {value && (
            <button
              type="button"
              className="oldkut-scrap-delete"
              style={{ display: 'block', marginTop: 6 }}
              onClick={() => onChange(null)}
            >
              {t('avatar.remove')}
            </button>
          )}
        </div>
      </div>
      {error && <p className="oldkut-error">{error}</p>}
    </div>
  );
}
