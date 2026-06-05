import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/profile';
import type { User } from '@/types/user';

const initialState: User = { name: '', email: '', phone: '', isLoggedIn: false, loading: true };

const UserStateContext = createContext<User>(initialState);

type UserActions = {
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const UserDispatchContext = createContext<UserActions | null>(null);

// Lee el perfil desde la tabla profiles (fuente de verdad) en lugar del user_metadata del JWT,
// que queda desactualizado hasta el próximo token refresh.
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
    // fetchProfile failed (network, RLS) — fall back to session email so app is never stuck
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<User>(initialState);

  const refresh = useCallback(async () => {
    const user = await loadFromProfile();
    setState(user);
  }, []);

  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState({ name: '', email: '', phone: '', isLoggedIn: false, loading: false });
      } else {
        setTimeout(refresh, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [refresh]);

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

export const useUserState = () => useContext(UserStateContext);
export const useUserActions = () => useContext(UserDispatchContext);
