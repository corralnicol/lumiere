
// este servicio es el encargado de interactuar con la base de datos de Supabase para obtener los detalles de un producto específico, incluyendo sus reseñas y calificaciones.

import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/types/database";
import type {
  ProductDetailItem,
  ProductReview,
} from "@/components/ProductDetail/ProductDetail";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export type SupabaseProductDetail = ProductDetailItem & {
  sellerId: string;
  active: boolean;
  createdAt: string;
  reviews: ProductReview[];
};

// en esta función lo que se hace es normalizar la calificación de un producto, asegurándose de que esté entre 1 y 5, y que sea un número finito. 

function normalizeRating(value: unknown): number {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return 5;
  }

  return Math.min(5, Math.max(1, rating));
}

//aqui lo que se hace es normalizar las reseñas del producto, asegurándose de que cada reseña tenga un usuario, una calificación y un comentario válidos.

function normalizeReviews(reviews: Json): ProductReview[] {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews
    .map((review) => {
      if (!review || typeof review !== "object" || Array.isArray(review)) {
        return null;
      }

      const reviewObject = review as Record<string, unknown>;

      const user =
        typeof reviewObject.user === "string"
          ? reviewObject.user
          : typeof reviewObject.author === "string"
            ? reviewObject.author
            : typeof reviewObject.name === "string"
              ? reviewObject.name
              : "Anonymous user";

      const comment =
        typeof reviewObject.comment === "string"
          ? reviewObject.comment
          : typeof reviewObject.text === "string"
            ? reviewObject.text
            : "";

      return {
        user,
        rating: normalizeRating(reviewObject.rating),
        comment,
      };
    })
    .filter((review): review is ProductReview => review !== null);
}

// en esta funcion se calcula la calificación promedio de un producto a partir de sus reseñas, asegurándose de que el resultado sea un número entre 1 y 5, y que tenga un decimal. 

function calculateAverageRating(reviews: ProductReview[]) {
  if (reviews.length === 0) {
    return 5;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
}

// en esta funcion se mapea la fila del producto obtenida de la base de datos de Supabase a un objeto de tipo SupabaseProductDetail, que es el formato que se utiliza en el frontend para mostrar los detalles del producto. 

function mapProductRowToDetail(product: ProductRow): SupabaseProductDetail {
  const reviews = normalizeReviews(product.reviews);

  return {
    id: product.id,
    category: "Beauty",
    brand: "Lumière",
    name: product.name,
    description: product.description ?? "",
    imageUrl: product.image_url ?? "",
    rating: calculateAverageRating(reviews),
    price: product.price,
    size: "Standard size",
    stock: product.stock,
    characteristics: [],
    reviews,
    sellerId: product.seller_id,
    active: product.active,
    createdAt: product.created_at,
  };
}

export async function getProductById(
  productId: string
): Promise<SupabaseProductDetail> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Product not found");
  }

  return mapProductRowToDetail(data);
}