import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/user';

const initialState: User = { name: '', email: '', phone: '', isLoggedIn: false, loading: true };

const UserStateContext = createContext<User>(initialState);

type UserActions = {
  logout: () => Promise<void>;
};

const UserDispatchContext = createContext<UserActions | null>(null);

async function loadFromClaims(): Promise<User> {
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return { name: '', email: '', phone: '', isLoggedIn: false, loading: false };
  }
  const meta = data.claims.user_metadata as Record<string, string> | undefined;
  const phone = meta?.phone ?? '';
  const firstName = meta?.first_name ?? '';
  const lastName = meta?.last_name ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || data.claims.email || '';
  return {
    id: data.claims.sub,
    name,
    email: data.claims.email ?? '',
    phone,
    isLoggedIn: true,
    loading: false,
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<User>(initialState);

  const refresh = useCallback(async () => {
    const user = await loadFromClaims();
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
  }), []);

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
