import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';

const initialState: User = {
  name: '',
  email: '',
  phone: '',
  isLoggedIn: false,
  loading: true,
};

// Guarda los datos del usuario que usa toda la app.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (_state, action: PayloadAction<User>) => action.payload,
    clearUser: () => ({ ...initialState, loading: false }),
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { clearUser, setAuthLoading, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
