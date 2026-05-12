import type { User } from "@/types/user";

type ActionType = { type: 'LOGIN'; payload: User } |
{ type: 'UPDATE_PROFILE'; payload: Partial<User> } |
{ type: 'LOGOUT' };

const raw = localStorage.getItem('user');
export const initialUserState: User = raw ? JSON.parse(raw) : { name: '', email: '', isLoggedIn: false };

export function userReducer(state: User, action: ActionType): User {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, ...action.payload, isLoggedIn: true };
    case 'UPDATE_PROFILE':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return { name: '', email: '', isLoggedIn: false };
    default:
      return state;
  }
}