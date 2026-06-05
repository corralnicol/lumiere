import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUserState } from '@/contexts/user/UserContext';
import { fetchServerCart, saveServerCart, mergeCarts } from '@/lib/cart';
import type { CartItem as CartItemLib } from '@/lib/cart';

// Definimos cómo se ve un producto en nuestra tienda
export interface Product {
  id: string;
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

// Un CartItem es un producto pero con la cantidad que el usuario quiere comprar
export interface CartItem extends Product {
  quantity: number;
}

// Estas son todas las acciones que se pueden hacer con el carrito
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const GUEST_CART_KEY = 'lumiere_cart';

// Creamos el contexto para que cualquier componente pueda acceder al carrito
const CartContext = createContext<CartContextType | undefined>(undefined);

// Este es el componente que envuelve toda la app y comparte el estado del carrito
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id: userId, isLoggedIn, loading: authLoading } = useUserState();

  // Empezamos con carrito vacío; la hidratación ocurre en el efecto de auth
  const [cart, setCart] = useState<CartItem[]>([]);

  // ready=true una vez que la fuente correcta (servidor o localStorage) fue cargada
  // Evita que el efecto de persistencia guarde datos antes de la hidratación inicial
  const [ready, setReady] = useState(false);

  // Efecto de autenticación: hidrata el carrito según el estado de login
  // Al iniciar sesión: carga el carrito del servidor y mezcla el carrito de invitado
  // Al cerrar sesión: carga el carrito de invitado desde localStorage
  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn && userId) {
      // Lee el carrito de invitado antes de limpiarlo
      const guestCart = (() => {
        try {
          const saved = localStorage.getItem(GUEST_CART_KEY);
          return saved ? (JSON.parse(saved) as CartItem[]) : [];
        } catch {
          return [];
        }
      })();

      (async () => {
        try {
          const serverCart = await fetchServerCart(userId) as CartItem[];
          const merged = mergeCarts(serverCart as CartItemLib[], guestCart as CartItemLib[]) as CartItem[];
          setCart(merged);
          await saveServerCart(userId, merged as CartItemLib[]);
        } catch (err) {
          console.error('Error al cargar el carrito del servidor:', err);
          // Fallback: usamos el carrito de invitado si el servidor falla
          setCart(guestCart);
        }

        // Limpiamos el carrito de invitado una vez que el servidor es la fuente de verdad
        localStorage.removeItem(GUEST_CART_KEY);
        setReady(true);
      })();
    } else {
      // No autenticado: cargamos el carrito de invitado desde localStorage
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        setCart(saved ? (JSON.parse(saved) as CartItem[]) : []);
      } catch {
        setCart([]);
      }
      setReady(true);
    }
  }, [userId, isLoggedIn, authLoading]);

  // Efecto de persistencia: guarda el carrito cada vez que cambia
  // Con debounce de 400ms para usuarios autenticados (evita saturar el servidor con clics +/-)
  useEffect(() => {
    if (!ready) return;

    if (isLoggedIn && userId) {
      const currentCart = cart;
      const timer = setTimeout(async () => {
        try {
          await saveServerCart(userId, currentCart as CartItemLib[]);
        } catch (err) {
          console.error('Error al guardar el carrito en el servidor:', err);
        }
      }, 400);
      return () => clearTimeout(timer);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  }, [cart, ready, isLoggedIn, userId]);

  // Función para agregar un producto al carrito
  // Si el producto ya está, solo le sumamos la cantidad
  const addToCart = useCallback((product: Product, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity));
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + amount } : item
        );
      }
      return [...prevCart, { ...product, quantity: amount }];
    });
  }, []);

  // Para eliminar un producto del carrito por completo
  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  // Para cambiar la cantidad de un producto (por ejemplo con los botones + y -)
  // Si la cantidad llega a 0, lo eliminamos
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  // Para vaciar todo el carrito (se usa al finalizar la compra)
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Calcula el precio total sumando precio * cantidad de cada producto
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Cuenta cuántos productos hay en total en el carrito
  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Compartimos el carrito y las funciones con toda la aplicación
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

// Este hook nos permite usar el carrito desde cualquier componente fácilmente
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};
