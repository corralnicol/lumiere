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
      // Esto guarda el usuario actual para perfil, compras y órdenes.
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.avatarUrl = action.payload.avatarUrl;
      state.session = action.payload.session;
    },
    clearUser(state) {
      // Cuando se cierre sesión, dejamos el estado limpio.
      state.userId = null;
      state.email = '';
      state.fullName = '';
      state.avatarUrl = '';
      state.session = null;
    },
    updateProfile(state, action: PayloadAction<Partial<AuthState>>) {
      // El perfil manda solo los campos que cambian, como nombre o foto.
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser, clearUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
