import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/database";

// Definimos cómo se ve un producto en nuestra tienda
export interface Product {
  id: number | string;
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
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const LOCAL_CART_KEY = "lumiere_cart";

// Creamos el contexto para que cualquier componente pueda acceder al carrito
const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => item as Partial<CartItem>)
    .filter(
      (item) =>
        item.id !== undefined &&
        item.name &&
        typeof item.price === "number"
    )
    .map((item) => ({
      id: item.id as number | string,
      category: item.category ?? "",
      brand: item.brand ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      rating: Number(item.rating ?? 0),
      price: Number(item.price ?? 0),
      size: item.size ?? "",
      stock: Number(item.stock ?? 0),
      quantity: Math.max(1, Number(item.quantity ?? 1)),
    }));
}
// aqui lo que se hace es obtener el carrito guardado en el localStorage del navegador, y si no existe o no es válido, se devuelve un carrito vacío. 
function getLocalCart(): CartItem[] {
  const savedCart = localStorage.getItem(LOCAL_CART_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return normalizeCart(JSON.parse(savedCart));
  } catch {
    return [];
  }
}

// Este es el componente que envuelve toda la app y comparte el estado del carrito
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Al iniciar, revisamos si ya hay un carrito guardado en el navegador.
  // Si el usuario inicia sesión, luego se intenta reemplazar por el carrito guardado en profiles.cart.
  const [cart, setCart] = useState<CartItem[]>(getLocalCart);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isCartReady, setIsCartReady] = useState(false);
  // aqui se carga el carrito del perfil del usuario desde la base de datos de Supabase, y se guarda en el estado del carrito y en el localStorage. 
  async function loadProfileCart(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("cart")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[CartContext] Could not load profile cart:", error.message);
      return;
    }

    const profileCart = normalizeCart(data?.cart);

    if (profileCart.length > 0) {
      setCart(profileCart);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(profileCart));
    }
  }
  
  useEffect(() => {
    let isMounted = true;

    async function loadInitialCart() {
      setIsCartReady(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) {
        return;
      }

      if (user) {
        setProfileId(user.id);
        await loadProfileCart(user.id);
      } else {
        setProfileId(null);
      }

      if (isMounted) {
        setIsCartReady(true);
      }
    }
    
    loadInitialCart();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsCartReady(false);

      const userId = session?.user?.id ?? null;
      setProfileId(userId);

      if (userId) {
        await loadProfileCart(userId);
      }

      setIsCartReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Cada vez que el carrito cambia, lo guardamos en localStorage y, si hay usuario, en profiles.cart.
  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));

    if (!profileId) {
      return;
    }

    const currentProfileId = profileId;

    async function saveProfileCart() {
      const { error } = await supabase
        .from("profiles")
        .update({
          cart: cart as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentProfileId);

      if (error) {
        console.error("[CartContext] Could not save profile cart:", error.message);
      }
    }

    saveProfileCart();
  }, [cart, profileId, isCartReady]);

  // Función para agregar un producto al carrito.
  // Si el producto ya está, solo le sumamos 1 a la cantidad.
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Para eliminar un producto del carrito por completo
  const removeFromCart = (productId: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Para cambiar la cantidad de un producto.
  // Si la cantidad llega a 0, lo eliminamos.
  const updateQuantity = (productId: number | string, quantity: number) => {
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

  // Para vaciar todo el carrito
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
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }

  return context;
};