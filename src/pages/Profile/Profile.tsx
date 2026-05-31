import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../services/supabaseApi';
import { AvatarUploader } from '../../components/AvatarUploader';
import { updateProfile as updateAuthProfile } from '../../features/auth/authSlice';
import { useUserActions, useUserState } from '../../contexts/user/UserContext';
import Navbar from '../../components/Navbar/Navbar';
import AuthFooter from '../../components/Footer/AuthFooter';
import './Profile.css';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth);
  const user = useUserState();
  const userActions = useUserActions();
  const navigate = useNavigate();
  const userId = authUser.userId ?? user?.email ?? null;

  // Obtener el perfil actual
  const { data: profile, isLoading, isError } = useGetProfileQuery(userId ?? '', {
    skip: !userId || !authUser.userId,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const currentProfile = profile?.[0];

  // Llenar el nombre cuando el perfil carga
  React.useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.full_name ?? '');
      return;
    }

    if (authUser.fullName || user?.name) {
      setName(authUser.fullName || user?.name || '');
    }
  }, [authUser.fullName, currentProfile, user?.name]);

  React.useEffect(() => {
    if (!userId && !user?.isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [navigate, user?.isLoggedIn, userId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      if (authUser.userId) {
        await updateProfile({ userId, full_name: trimmedName }).unwrap();
      }
      // actualizar estados locales para que se vea el cambio de una vez
      dispatch(updateAuthProfile({ userId, fullName: trimmedName }));
      userActions?.updateProfile({ name: trimmedName });
      setMessage('Perfil actualizado.');
    } catch (err) {
      console.error('Error updating profile', err);
      setMessage('No pudimos guardar el perfil. Revisa Supabase e intenta otra vez.');
    }
  };

  if (!userId && !user?.isLoggedIn) {
    return null;
  }

  const currentAvatarUrl = currentProfile?.avatar_url ?? authUser.avatarUrl;

  return (
    <div className="profile-shell">
      <Navbar />

      <main className="profile-page">
        <section className="profile-card">
          <Link to="/account" className="profile-back-link">
            Volver a mi cuenta
          </Link>

          <div className="profile-heading">
            <p>Mi cuenta</p>
            <h1>Perfil</h1>
          </div>

          {isLoading && <p className="profile-message">Cargando perfil...</p>}
          {isError && (
            <p className="profile-message profile-message--warning">
              No pudimos leer el perfil en Supabase, pero puedes revisar tus datos locales.
            </p>
          )}
          {message && <p className="profile-message">{message}</p>}

          <AvatarUploader
            currentAvatarUrl={currentAvatarUrl}
            disabled={!authUser.userId}
            onAvatarUploaded={(avatarUrl) => {
              dispatch(updateAuthProfile({ avatarUrl }));
              setMessage('Foto de perfil actualizada.');
            }}
          />

          <form onSubmit={handleSubmit} className="profile-form">
            <label htmlFor="profileName">
              Nombre
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label htmlFor="profileEmail">
              Correo
              <input
                id="profileEmail"
                type="email"
                value={authUser.email || user?.email || ''}
                disabled
              />
            </label>

            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>

          {!authUser.userId && (
            <p className="profile-note">
              Inicia sesión con Supabase para guardar foto y nombre en la base de datos.
            </p>
          )}
        </section>
      </main>

      <AuthFooter />
    </div>
  );
};

export default Profile;
