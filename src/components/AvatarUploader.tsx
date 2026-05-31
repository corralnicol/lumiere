// src/components/AvatarUploader.tsx

import React, { useState, ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useUpdateProfileMutation } from '../services/supabaseApi';

// TODO: replace with real Supabase client/config when available
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

export const AvatarUploader: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const [updateProfile] = useUpdateProfileMutation();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    // preview for UI feedback
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    // upload to Supabase Storage (placeholder implementation)
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/avatars/${userId}.png`;
    try {
      const res = await fetch(uploadUrl, {
        method: 'POST', // Supabase uses POST for upload
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: file,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${userId}.png`;
      // Update profile avatar_url field
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
