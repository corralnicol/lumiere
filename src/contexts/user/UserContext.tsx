import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { userReducer, initialUserState } from './userReducer';
import type { User } from '@/types/user';

const UserStateContext = createContext<User | null>(null);
type UserActions = {
  login: (userData: User) => void;
  updateProfile: (fields: Partial<User>) => void;
  logout: () => void;
};

const UserDispatchContext = createContext<UserActions | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(state));
  }, [state]);

  const actions = useMemo<UserActions>(() => ({
    login: (userData: User) => dispatch({ type: 'LOGIN', payload: userData }),
    updateProfile: (fields: Partial<User>) => dispatch({ type: 'UPDATE_PROFILE', payload: fields }),
    logout: () => dispatch({ type: 'LOGOUT' }),
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