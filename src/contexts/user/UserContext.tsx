import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { userReducer, initialUserState } from './userReducer';
import type { User } from '@/types/user';

const UserStateContext = createContext<User | null>(null);
const UserDispatchContext = createContext<ReturnType<typeof useMemo> | null>(null);

export function UserProvider({ children } : { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialUserState);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(state));
  }, [state]);

  const actions = useMemo(() => ({
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