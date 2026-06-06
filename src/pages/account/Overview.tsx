import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserActions, useUserState } from "@/contexts/user/useUser";
import { fetchProfile, updateProfileName, uploadAvatar } from "@/lib/profile";
import Navbar from "@/components/Navbar/Navbar";
import AuthFooter from "@/components/Footer/AuthFooter";
import "./account.css";

const AccountOverview = () => {
  const user = useUserState();
  const actions = useUserActions();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoggedIn = Boolean(user?.isLoggedIn);
  const loading = Boolean(user?.loading);
  const userId = user?.id ?? '';

  // Redirige si no está autenticado
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/auth/sign-in", { replace: true });
    }
  }, [loading, isLoggedIn, navigate]);

  // Estado local del perfil (editable)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Carga los datos del perfil desde profiles.
  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId).then((p) => {
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setEmail(p.email);
      setPhone(p.phone);
      setAvatarUrl(p.avatarUrl);
    });
  }, [userId]);

  // Estado del formulario de nombre
  const [editingName, setEditingName] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  const startNameEdit = () => {
    setEditFirst(firstName);
    setEditLast(lastName);
    setNameError('');
    setEditingName(true);
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNameError('');
  };

  const saveName = async () => {
    if (savingName) return;
    setSavingName(true);
    setNameError('');
    try {
      await updateProfileName(userId, editFirst.trim(), editLast.trim());
      setFirstName(editFirst.trim());
      setLastName(editLast.trim());
      setEditingName(false);
      await actions?.refreshProfile?.();
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Error al guardar el nombre.');
    } finally {
      setSavingName(false);
    }
  };

  // Estado del avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const url = await uploadAvatar(userId, file);
      setAvatarUrl(url);
      await actions?.refreshProfile?.();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Error al subir la foto.');
    } finally {
      setUploadingAvatar(false);
      // Limpiamos el campo para poder elegir la misma imagen otra vez.
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    try {
      await actions?.logout?.();
    } catch (err) {
      console.error('[handleLogout]', err);
    }
    navigate("/auth/sign-in", { replace: true });
  };

  if (loading || !isLoggedIn) return null;

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Guest';
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join('') || '?';

  return (
    <div className="account-container">
      <Navbar />

      <main className="account-main">
        <section className="account-card">
          <h2 className="account-title">Account overview</h2>
          <p className="account-subtitle">Welcome back, {displayName}.</p>

          {/* Avatar */}
          <div className="account-avatar-section">
            <div className="account-avatar-wrapper">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="account-avatar-img" />
              ) : (
                <div className="account-avatar-initials">{initials}</div>
              )}
              {uploadingAvatar && (
                <div className="account-avatar-overlay">
                  <span className="account-avatar-spinner"></span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="account-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="account-avatar-input"
              onChange={handleAvatarChange}
            />
            {avatarError && <p className="account-field-error">{avatarError}</p>}
          </div>

          <div className="account-details">
            {/* Nombre (editable) */}
            <div className="account-detail-row account-detail-name">
              <span>Name</span>
              {editingName ? (
                <div className="account-name-edit">
                  <div className="account-name-inputs">
                    <input
                      type="text"
                      className="account-edit-input"
                      placeholder="First name"
                      value={editFirst}
                      onChange={(e) => setEditFirst(e.target.value)}
                      disabled={savingName}
                      autoFocus
                    />
                    <input
                      type="text"
                      className="account-edit-input"
                      placeholder="Last name"
                      value={editLast}
                      onChange={(e) => setEditLast(e.target.value)}
                      disabled={savingName}
                    />
                  </div>
                  {nameError && <p className="account-field-error">{nameError}</p>}
                  <div className="account-name-actions">
                    <button
                      type="button"
                      className="account-save-btn"
                      onClick={saveName}
                      disabled={savingName}
                    >
                      {savingName ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="account-cancel-btn"
                      onClick={cancelNameEdit}
                      disabled={savingName}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="account-name-display">
                  <strong>{displayName}</strong>
                  <button
                    type="button"
                    className="account-edit-btn"
                    onClick={startNameEdit}
                    aria-label="Edit name"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email (solo lectura) */}
            <div className="account-detail-row">
              <span>Email</span>
              <strong>{email || 'Not provided'}</strong>
            </div>

            {/* Teléfono (solo lectura) */}
            <div className="account-detail-row">
              <span>Phone</span>
              <strong>{phone || 'Not provided'}</strong>
            </div>
          </div>

          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </section>
      </main>

      <AuthFooter />
    </div>
  );
};

export default AccountOverview;
