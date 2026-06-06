import React, { useEffect, useCallback } from 'react';
import { useUserState } from '@/contexts/user/useUser';
import { fetchServerCart, saveServerCart, mergeCarts } from '@/lib/cart';
import type { CartItem as CartItemLib } from '@/lib/cart';
import { CartContext, GUEST_CART_KEY, type CartItem, type Product } from './cartContextValues';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addCartItem,
  clearCart as clearReduxCart,
  removeCartItem,
  setCart,
  setCartReady,
  updateCartQuantity,
} from '@/store/slices/cartSlice';

// Este componente comparte el carrito con toda la app.
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { id: userId, isLoggedIn, loading: authLoading } = useUserState();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const ready = useAppSelector((state) => state.cart.ready);

  // Carga el carrito correcto según si el usuario inició sesión o no.
  useEffect(() => {
    if (authLoading) return;
    dispatch(setCartReady(false));

    if (isLoggedIn && userId) {
      // Guardamos el carrito de invitado antes de mezclarlo.
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
          dispatch(setCart(merged));
          await saveServerCart(userId, merged as CartItemLib[]);
        } catch (err) {
          console.error('Error al cargar el carrito del servidor:', err);
          // Si falla Supabase, usamos el carrito local.
          dispatch(setCart(guestCart));
        }

        // Ya quedó guardado en Supabase, entonces limpiamos el local.
        localStorage.removeItem(GUEST_CART_KEY);
        dispatch(setCartReady(true));
      })();
    } else {
      // Si no hay sesión, usamos el carrito del navegador.
      try {
        const saved = localStorage.getItem(GUEST_CART_KEY);
        dispatch(setCart(saved ? (JSON.parse(saved) as CartItem[]) : []));
      } catch {
        dispatch(setCart([]));
      }
      dispatch(setCartReady(true));
    }
  }, [userId, isLoggedIn, authLoading, dispatch]);

  // Guarda el carrito cuando cambia.
  // Esperamos un poco para no enviar muchos cambios seguidos.
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

  // Agrega un producto o suma cantidad si ya existe.
  const addToCart = useCallback((product: Product, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity));
    dispatch(addCartItem({ product, quantity: amount }));
  }, [dispatch]);

  // Elimina un producto del carrito.
  const removeFromCart = useCallback((productId: string) => {
    dispatch(removeCartItem(productId));
  }, [dispatch]);

  // Cambia la cantidad de un producto.
  // Si queda en cero, se elimina.
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeCartItem(productId));
      return;
    }
    dispatch(updateCartQuantity({ productId, quantity }));
  }, [dispatch]);

  // Vacía el carrito después de comprar.
  const clearCart = useCallback(() => {
    dispatch(clearReduxCart());
  }, [dispatch]);

  // Calcula el total del carrito.
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // Cuenta todos los productos del carrito.
  const getCartCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Compartimos el carrito y sus acciones.
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
