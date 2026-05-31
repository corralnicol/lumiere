import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Definimos cómo se ve un producto en nuestra tienda
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

// Un CartItem es un producto pero con la cantidad que el usuario quiere comprar
interface CartItem extends Product {
  quantity: number;
}

// Estas son todas las acciones que se pueden hacer con el carrito
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

// Creamos el contexto para que cualquier componente pueda acceder al carrito
const CartContext = createContext<CartContextType | undefined>(undefined);

// Este es el componente que envuelve toda la app y comparte el estado del carrito
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Al iniciar, revisamos si ya hay un carrito guardado en el navegador (localStorage)
  // Así no se pierde cuando el usuario recarga la página
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('lumiere_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Cada vez que el carrito cambia, lo guardamos en localStorage para que persista
  useEffect(() => {
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  }, [cart]);

  // Función para agregar un producto al carrito
  // Si el producto ya está, solo le sumamos 1 a la cantidad
  const addToCart = (product: Product, quantity = 1) => {
    const quantityToAdd = Math.max(1, quantity);

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });
  };

  // Para eliminar un producto del carrito por completo
  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Para cambiar la cantidad de un producto (por ejemplo con los botones + y -)
  // Si la cantidad llega a 0, lo eliminamos
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Para vaciar todo el carrito (se usa al finalizar la compra)
  const clearCart = () => {
    setCart([]);
  };

  // Calcula el precio total sumando precio * cantidad de cada producto
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Cuenta cuántos productos hay en total en el carrito
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

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
