import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";
import type { Product, ProductCharacteristics, ProductReview } from "@/types/products";
import type { ProductCategory } from "@/types/products";

export function computeRating(reviews: { rating: number }[]): number {
    if (!reviews.length) return 0;
    return Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length);
}

export function mapRowToProduct(row: Tables<"products">): Product {
    const reviewsJson = JSON.parse(row.reviews?.toString() ?? "[]");
    const reviews = (Array.isArray(reviewsJson) ? reviewsJson : []) as unknown as ProductReview[];
    const characteristicsJson = JSON.parse(row.characteristics?.toString() ?? "[]");
    const characteristics = (Array.isArray(characteristicsJson) ? characteristicsJson : []) as unknown as ProductCharacteristics[];

    return {
        id: row.id,
        category: (row.category ?? null) as ProductCategory | null,
        brand: row.brand,
        name: row.name,
        description: row.description ?? "",
        howToUse: row.how_to_use,
        ingredients: row.ingredients,
        rating: computeRating(reviews),
        price: Number(row.price),
        size: row.size,
        stock: row.stock,
        active: row.active,
        sellerId: row.seller_id,
        imageUrl: row.image_url,
        reviews,
        characteristics,
        createdAt: row.created_at,
    };
}

export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("stock", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapRowToProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("active", true)
        .maybeSingle();

        
    if (error) throw error;
    return data ? mapRowToProduct(data) : null;
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .eq("active", true);

    if (error) throw error;
    return (data ?? []).map(mapRowToProduct);
}

export async function fetchKits(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("category", null)
        .eq("active", true);

    if (error) throw error;
    return (data ?? []).map(mapRowToProduct);
}
