
import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAppSelector } from '../app/hooks';
import { useUpdateProfileMutation } from '../services/supabaseApi';

// Nico, reemplaza esto con la config real de Supabase cuando esté lista
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const AvatarUploader: React.FC = () => {
  const { userId } = useAppSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    // vista previa de la imagen para que el usuario vea lo que subió
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    // subir la imagen al Storage de Supabase (por ahora es placeholder)
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
      // actualizar el campo avatar_url en el perfil
      await updateProfile({ userId, avatarUrl: publicUrl }).unwrap();
    } catch (err) {
      console.error('Avatar upload error', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-uploader">
      <label>
        <input type="file" accept="image/png" onChange={handleFileChange} disabled={uploading} />
        {uploading ? 'Subiendo...' : 'Selecciona una foto'}
      </label>
      {preview && <img src={preview} alt="preview" className="avatar-preview" />}
    </div>
  );
};
