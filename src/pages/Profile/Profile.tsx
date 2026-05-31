import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../services/supabaseApi';
import { AvatarUploader } from '../../components/AvatarUploader';
import { updateProfile as updateAuthProfile } from '../../features/auth/authSlice';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userId);

  // Obtener el perfil actual
  const { data: profile, isLoading, isError } = useGetProfileQuery(userId ?? '', {
    skip: !userId,
  });

  const [updateProfile] = useUpdateProfileMutation();

  const [name, setName] = useState('');

  // Llenar el nombre cuando el perfil carga
  React.useEffect(() => {
    if (profile?.[0]) {
      setName(profile[0].full_name ?? '');
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await updateProfile({ userId, name }).unwrap();
      // Actualizar el slice de auth para que la UI refleje el nuevo nombre inmediatamente
      dispatch(updateAuthProfile({ userId, fullName: name }));
    } catch (err) {
      console.error('Error updating profile', err);
    }
  };

  if (isLoading) return <p>Cargando perfil...</p>;
  if (isError) return <p>Error al cargar el perfil.</p>;

  return (
    <div className="profile-page">
      <h1>Perfil</h1>
      <AvatarUploader />
      <form onSubmit={handleSubmit} className="profile-form">
        <label>
          Nombre:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <button type="submit">Guardar cambios</button>
      </form>
    </div>
  );
};

export default Profile;
