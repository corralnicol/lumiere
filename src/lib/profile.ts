import { supabase } from '@/lib/supabase';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

// Lee los datos del perfil desde profiles.
export async function fetchProfile(userId: string): Promise<ProfileData> {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, phone, avatar_url')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return {
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    avatarUrl: data.avatar_url ?? '',
  };
}

// Actualiza nombre y apellido en profiles
export async function updateProfileName(
  userId: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName })
    .eq('id', userId);
  if (error) throw error;
}

// Sube el avatar y guarda su URL en el perfil.
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const path = `avatars/${userId}.png`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Agregamos la fecha para que se vea la imagen nueva.
  const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: bustedUrl })
    .eq('id', userId);
  if (updateError) throw updateError;

  return bustedUrl;
}
