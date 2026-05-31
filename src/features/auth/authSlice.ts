import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  userId: string | null;
  email: string;
  fullName: string;
  avatarUrl: string;
  session: {
    accessToken: string;
    refreshToken?: string;
  } | null;
}

const initialState: AuthState = {
  userId: null,
  email: '',
  fullName: '',
  avatarUrl: '',
  session: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState>) {
      // Nico aquí guardo la info del usuario luego del login
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.avatarUrl = action.payload.avatarUrl;
      state.session = action.payload.session;
    },
    clearUser(state) {
      // esto resetea el estado cuando el usuario cierra sesión
      state.userId = null;
      state.email = '';
      state.fullName = '';
      state.avatarUrl = '';
      state.session = null;
    },
    updateProfile(state, action: PayloadAction<Partial<AuthState>>) {
      // actualiza solo los campos que llegan desde el perfil
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser, clearUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
