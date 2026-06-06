import { supabase } from '@/lib/supabase';
import type { Json } from '@/types/database';

// Debe tener la misma forma que el producto del carrito.
export interface CartItem {
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
  quantity: number;
}

// Agrega product_id para que Supabase pueda crear la orden.
// Guardamos los demás datos para mostrar el carrito sin pedirlos otra vez.
export function serializeCart(items: CartItem[]): Json {
  return items.map((item) => ({
    ...item,
    product_id: item.id,
  })) as unknown as Json;
}

// Convierte el carrito guardado en datos que la app pueda usar.
export function deserializeCart(raw: Json): CartItem[] {
  const arr = raw as unknown;
  if (!Array.isArray(arr)) return [];
  return (arr as unknown[])
    .filter((el): el is Record<string, unknown> => el !== null && typeof el === 'object' && !Array.isArray(el))
    .map((el) => ({
      id: String(el['product_id'] ?? el['id'] ?? ''),
      category: String(el['category'] ?? ''),
      brand: String(el['brand'] ?? ''),
      name: String(el['name'] ?? ''),
      description: String(el['description'] ?? ''),
      imageUrl: String(el['imageUrl'] ?? ''),
      rating: Number(el['rating'] ?? 0),
      price: Number(el['price'] ?? 0),
      size: String(el['size'] ?? ''),
      stock: Number(el['stock'] ?? 0),
      quantity: Math.max(1, Math.floor(Number(el['quantity'] ?? 1))),
    }))
    .filter((item) => item.id !== '');
}

// Une dos carritos: si un producto aparece en ambos, suma las cantidades
export function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of a) {
    map.set(item.id, { ...item });
  }
  for (const item of b) {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

// Lee el carrito guardado en Supabase.
export async function fetchServerCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('cart')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return deserializeCart(data.cart);
}

// Guarda el carrito del usuario en Supabase.
export async function saveServerCart(userId: string, items: CartItem[]): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ cart: serializeCart(items) })
    .eq('id', userId);
  if (error) throw error;
}
