import React, { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addItem,
  clearCart as clearReduxCart,
  removeItem,
  updateQuantity as updateReduxQuantity,
} from '../features/cart/cartSlice';

// Mantengo este tipo igual al carrito viejo para no romper pantallas existentes.
export interface Product {
  id: number;
  category: string;
  brand: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: number;
  size: string;
  stock: number;
}

// Un item del carrito es el producto más la cantidad elegida.
interface CartItem extends Product {
  quantity: number;
}

// Este contexto queda como puente: por dentro usa Redux, por fuera no cambia.
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);

  // Guardamos copia local para que el carrito no se pierda al recargar.
  useEffect(() => {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  }, [cart]);

  // Si el producto ya existe, Redux solo suma la cantidad.
  const addToCart = (product: Product, quantity = 1) => {
    dispatch(addItem({ ...product, quantity }));
  };

  const removeFromCart = (productId: number) => {
    dispatch(removeItem(productId));
  };

  // Si la cantidad llega a 0, lo sacamos del carrito.
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    dispatch(updateReduxQuantity({ id: productId, quantity }));
  };

  const clearCart = () => {
    dispatch(clearReduxCart());
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Las pantallas antiguas pueden seguir usando este hook sin saber que ahora hay Redux detrás.
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};
