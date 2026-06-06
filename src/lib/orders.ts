import { supabase } from '@/lib/supabase';

// Crea una orden usando el carrito guardado del usuario.
// Supabase valida stock, guarda la compra y limpia el carrito.
// Devuelve el id de la orden creada.
export async function placeOrder(): Promise<string> {
  const { data, error } = await supabase.rpc('place_order');
  if (error) throw new Error(error.message);
  return data as string;
}
