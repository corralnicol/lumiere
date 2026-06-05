import { CartProvider } from './CartContext';
import { UserProvider } from './user/UserContext';
import { FavoritesProvider } from './favorites/FavoritesContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <FavoritesProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}