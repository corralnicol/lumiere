import { supabase } from '@/lib/supabase';

// Crea una orden a partir del carrito guardado en profiles.cart del usuario autenticado.
// El RPC valida stock, inserta orders + order_items, decrementa products.stock
// y limpia profiles.cart — todo en una sola transacción atómica.
// Devuelve el UUID de la orden creada.
export async function placeOrder(): Promise<string> {
  const { data, error } = await supabase.rpc('place_order');
  if (error) throw new Error(error.message);
  return data as string;
}
