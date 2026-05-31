import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  userId: string | null;
  email: string;
  fullName: string;
  avatarUrl: string;
}

const initialState: AuthState = {
  userId: null,
  email: '',
  fullName: '',
  avatarUrl: '',
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
    },
    clearUser(state) {
      // esto resetea el estado cuando el usuario cierra sesión
      state.userId = null;
      state.email = '';
      state.fullName = '';
      state.avatarUrl = '';
    },
    updateProfile(state, action: PayloadAction<Partial<AuthState>>) {
      // actualiza solo los campos que llegan desde el perfil
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser, clearUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
