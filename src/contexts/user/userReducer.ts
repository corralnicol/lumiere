import type { User } from "@/types/user";

type ActionType = { type: 'LOGIN'; payload: User } |
{ type: 'UPDATE_PROFILE'; payload: Partial<User> } |
{ type: 'LOGOUT' };

const raw = localStorage.getItem('user');
const parsed = raw ? (JSON.parse(raw) as Partial<User>) : null;
export const initialUserState: User = {
  name: parsed?.name ?? '',
  email: parsed?.email ?? '',
  phone: parsed?.phone ?? '',
  isLoggedIn: parsed?.isLoggedIn ?? false,
};

export function userReducer(state: User, action: ActionType): User {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, ...action.payload, isLoggedIn: true };
    case 'UPDATE_PROFILE':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return { name: '', email: '', phone: '', isLoggedIn: false };
    default:
      return state;
  }
}