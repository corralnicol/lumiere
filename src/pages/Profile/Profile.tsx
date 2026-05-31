import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetProfileQuery, useUpdateProfileMutation } from '../../services/supabaseApi';
import { AvatarUploader } from '../../components/AvatarUploader';
import { updateProfile as updateAuthProfile } from '../../features/auth/authSlice';
import { useUserActions, useUserState } from '../../contexts/user/UserContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Profile.css';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth);
  const user = useUserState();
  const userActions = useUserActions();
  const userId = authUser.userId ?? user?.email ?? null;

  // Traemos el perfil para mostrar nombre y foto guardados en Supabase.
  const { data: profile, isLoading, isError } = useGetProfileQuery(userId ?? '', {
    skip: !userId || !authUser.userId,
  });

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const currentProfile = profile?.[0];

  const showFeedback = (feedbackMessage: string) => {
    setMessage(feedbackMessage);
  };

  // Si Supabase responde, usamos ese nombre; si no, usamos el login local.
  React.useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.full_name ?? '');
      return;
    }

    if (authUser.fullName || user?.name) {
      setName(authUser.fullName || user?.name || '');
    }
  }, [authUser.fullName, currentProfile, user?.name]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      if (authUser.userId) {
        await updateProfile({ userId, full_name: trimmedName }).unwrap();
      }
      // Actualizamos ambos estados mientras terminamos de unir login real con Supabase.
      dispatch(updateAuthProfile({ userId, fullName: trimmedName }));
      userActions?.updateProfile({ name: trimmedName });
      setMessage('Perfil actualizado.');
    } catch (err) {
      console.error('Error updating profile', err);
      setMessage('No pudimos guardar el perfil. Revisa Supabase e intenta otra vez.');
    }
  };

  const currentAvatarUrl = currentProfile?.avatar_url ?? authUser.avatarUrl;

  return (
    <div className="profile-shell">
      <Header onFeedback={showFeedback} />

      <main className="profile-page">
        <section className="profile-card">
          <Link to={userId ? '/account' : '/login'} className="profile-back-link">
            {userId ? 'Volver a mi cuenta' : 'Iniciar sesión'}
          </Link>

          <div className="profile-heading">
            <p>Mi cuenta</p>
            <h1>Perfil</h1>
          </div>

          {!userId && (
            <p className="profile-message profile-message--warning">
              Inicia sesión para editar tu perfil.
            </p>
          )}

          {isLoading && <p className="profile-message">Cargando perfil...</p>}
          {isError && (
            <p className="profile-message profile-message--warning">
              No pudimos leer el perfil en Supabase, pero puedes revisar tus datos locales.
            </p>
          )}
          {message && <p className="profile-message">{message}</p>}

          <AvatarUploader
            currentAvatarUrl={currentAvatarUrl}
            disabled={!authUser.userId || !userId}
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

      <Footer onFeedback={showFeedback} />
    </div>
  );
};

export default Profile;
