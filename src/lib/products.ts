import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/types/database";
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

export async function addReview(
    productId: string,
    rating: number,
    text: string,
): Promise<ProductReview> {
    console.log(rating);
    const { data, error } = await supabase.rpc("add_review", {
        p_product_id: productId,
        p_text: text,
        p_rating: rating,
    });
    if (error) {
        console.error(error);
        throw error;
    }
    return data as unknown as ProductReview;
}

export type NewProductInput = {
    name: string;
    brand: string;
    price: number;
    size?: string;
    stock?: number;
    category: string | null;
    characteristics: string[];
    description?: string;
    howToUse?: string;
    ingredients?: string;
    imageUrl?: string | null;
};

export async function createProduct(
    input: NewProductInput,
    sellerId: string,
): Promise<Product> {
    const row: TablesInsert<"products"> = {
        seller_id: sellerId,
        name: input.name,
        brand: input.brand,
        price: input.price,
        size: input.size ?? "",
        stock: input.stock ?? 0,
        category: input.category,
        characteristics: JSON.stringify(input.characteristics),
        description: input.description ?? null,
        how_to_use: input.howToUse ?? "",
        ingredients: input.ingredients ?? "",
        image_url: input.imageUrl || null,
        reviews: "[]",
    };

    const { data, error } = await supabase
        .from("products")
        .insert(row)
        .select("*")
        .single();

    if (error) throw error;
    return mapRowToProduct(data);
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
