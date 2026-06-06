import { createContext } from 'react';
import type { User } from '@/types/user';

export const initialUserState: User = {
  name: '',
  email: '',
  phone: '',
  isLoggedIn: false,
  loading: true,
};

export type UserActions = {
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const UserStateContext = createContext<User>(initialUserState);
export const UserDispatchContext = createContext<UserActions | null>(null);
