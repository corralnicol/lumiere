export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  loading?: boolean;
}
