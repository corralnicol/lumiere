import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAppSelector } from '../app/hooks';
import { useUpdateProfileMutation } from '../services/supabaseApi';

// Nico: estas variables salen del .env, igual que en supabaseApi.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

type AvatarUploaderProps = {
  currentAvatarUrl?: string;
  disabled?: boolean;
  onAvatarUploaded?: (avatarUrl: string) => void;
};

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl = '',
  disabled = false,
  onAvatarUploaded,
}) => {
  const { userId } = useAppSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || disabled) return;
    setError('');
    // Mostramos la foto de una vez, antes de esperar a Supabase.
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    // Ruta pedida para la entrega: avatars/{user_id}.png
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${userId}.png`;
    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: file,
      });
      if (!res.ok) throw new Error('Upload failed');
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${userId}.png`;
      // Después de subirla, guardamos la URL pública en profiles.avatar_url.
      await updateProfile({ userId, avatar_url: publicUrl }).unwrap();
      onAvatarUploaded?.(publicUrl);
    } catch (err) {
      console.error('Avatar upload error', err);
      setError('No pudimos subir la foto. Revisa la conexión con Supabase.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <label>
        <input
          type="file"
          accept="image/png"
          onChange={handleFileChange}
          disabled={uploading || disabled}
        />
        {uploading ? 'Subiendo...' : 'Selecciona una foto'}
      </label>
      {(preview || currentAvatarUrl) && (
        <img src={preview ?? currentAvatarUrl} alt="Foto de perfil" className="avatar-preview" />
      )}
      {!preview && !currentAvatarUrl && (
        <div className="avatar-placeholder">
          <i className="fa-regular fa-user" aria-hidden="true"></i>
        </div>
      )}
      {error && <p className="avatar-error">{error}</p>}
    </div>
  );
};
