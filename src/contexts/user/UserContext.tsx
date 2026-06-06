import { useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/profile';
import type { User } from '@/types/user';
import {
  UserDispatchContext,
  UserStateContext,
  type UserActions,
} from './userContextValues';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser, setUser } from '@/store/slices/authSlice';

// Lee el perfil desde profiles porque ahí están los datos más actualizados.
async function loadFromProfile(): Promise<User> {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { name: '', email: '', phone: '', isLoggedIn: false, loading: false };
  }
  const userId = data.claims.sub;
  const email = data.claims.email ?? '';
  try {
    const profile = await fetchProfile(userId);
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || email;
    return {
      id: userId,
      name,
      email: profile.email || email,
      phone: profile.phone,
      avatarUrl: profile.avatarUrl,
      isLoggedIn: true,
      loading: false,
    };
  } catch {
    // Si falla profiles, usamos el email de la sesión para que la app no se quede cargando.
    return {
      id: userId,
      name: email,
      email,
      phone: '',
      avatarUrl: '',
      isLoggedIn: true,
      loading: false,
    };
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const state = useAppSelector((storeState) => storeState.auth);
  const dispatch = useAppDispatch();

  const refresh = useCallback(async () => {
    const user = await loadFromProfile();
    dispatch(setUser(user));
  }, [dispatch]);

  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        dispatch(clearUser());
      } else {
        setTimeout(refresh, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, refresh]);

  const actions = useMemo<UserActions>(() => ({
    logout: async () => {
      await supabase.auth.signOut();
    },
    refreshProfile: refresh,
  }), [refresh]);

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={actions}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}
