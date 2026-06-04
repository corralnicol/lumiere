// este servicio es el encargado de interactuar con la base de datos de Supabase para obtener los detalles de un producto específico, incluyendo sus reseñas y calificaciones.

import { supabase } from "@/lib/supabase";
import type { Database, Json } from "@/types/database";
import type {
  ProductDetailItem,
  ProductReview,
} from "@/components/ProductDetail/ProductDetail";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const PRODUCT_IMAGES_BUCKET = "products";

export type SupabaseProductDetail = ProductDetailItem & {
  sellerId: string;
  active: boolean;
  createdAt: string;
  reviews: ProductReview[];
};

export type PublishProductPayload = {
  category: string;
  characteristics: string[];
  name: string;
  brand: string;
  price: number;
  size?: string;
  stock?: number;
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

// aqui lo que se hace es agregar una nueva reseña a un producto específico, enviando la información de la reseña al backend a través de una función de Supabase.

export type AddReviewPayload = {
  productId: string | number;
  text: string;
  rating: number;
};

// esta funcion se esncarga de enviar una nueva reseña a la edge function add_review de Supabase, pasando el ID del producto, el texto de la reseña y la calificación.

export async function addReviewToProduct({
  productId,
  text,
  rating,
}: AddReviewPayload): Promise<ProductReview[]> {
  const { data, error } = await supabase.functions.invoke("add_review", {
    body: {
      product_id: productId,
      text,
      rating,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (Array.isArray(data)) {
    return normalizeReviews(data as Json);
  }

  if (data && typeof data === "object" && "reviews" in data) {
    return normalizeReviews((data as { reviews: Json }).reviews);
  }

  return [];
}

// esta funcion crea la URL externa de Pollinations usando los datos del producto.

function buildPollinationsImageUrl(product: PublishProductPayload) {
  const prompt = [
    "close up macro still life product photography",
    "single beauty skincare product container",
    product.brand,
    product.name,
    product.category,
    product.characteristics.join(" "),
    "premium cosmetic packaging",
    "soft pink background",
    "studio lighting",
    "no people",
    "no faces",
  ]
    .filter(Boolean)
    .join(" ");

  const encodedPrompt = encodeURIComponent(prompt);

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=500&height=500&nologo=true&seed=${Date.now()}`;
}

// esta funcion descarga la imagen generada externamente y la convierte en un archivo tipo Blob.

async function downloadImageAsBlob(imageUrl: string) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error("Could not download generated product image");
  }

  return response.blob();
}

// esta funcion sube la imagen al Storage Bucket de Supabase en la ruta products/{uuid}.png.

async function uploadProductImageToStorage(imageBlob: Blob) {
  const imageId = crypto.randomUUID();
  const filePath = `products/${imageId}.png`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, imageBlob, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// esta funcion publica el producto completo: genera imagen, la sube a Supabase Storage y guarda el producto en la tabla products.

export async function publishProductWithStoredImage(
  product: PublishProductPayload
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be logged in to publish a product");
  }

  const pollinationsImageUrl = buildPollinationsImageUrl(product);
  const imageBlob = await downloadImageAsBlob(pollinationsImageUrl);
  const storedImageUrl = await uploadProductImageToStorage(imageBlob);

  const descriptionParts = [
    `${product.brand} ${product.name}`,
    product.category ? `Category: ${product.category}` : "",
    product.size ? `Size: ${product.size}` : "",
    product.characteristics.length > 0
      ? `Characteristics: ${product.characteristics.join(", ")}`
      : "",
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      description: descriptionParts.join(". "),
      price: product.price,
      image_url: storedImageUrl,
      stock: product.stock ?? 1,
      seller_id: user.id,
      reviews: [],
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProductRowToDetail(data);
}