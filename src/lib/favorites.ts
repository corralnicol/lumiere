import { supabase } from "@/lib/supabase";

export async function fetchFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("favorites")
        .eq("id", userId)
        .single();
    if (error) throw error;
    return data?.favorites ?? [];
}

export async function toggleFavorite(productId: string): Promise<string[]> {
    const { data, error } = await supabase.rpc("toggle_favorite", {
        p_product_id: productId,
    });
    if (error) throw error;
    return (data ?? []) as string[];
}
