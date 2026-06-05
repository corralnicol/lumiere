import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProductUpload {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export const uploadProducts = async (products: ProductUpload[]) => {

}
