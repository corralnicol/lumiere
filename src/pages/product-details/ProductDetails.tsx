// Este componente muestra los detalles de un producto específico.
// También se encarga de cargar la imagen correcta y evitar imágenes aleatorias.

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
  type ProductDetailItem,
  type ProductReview,
} from "@/components/ProductDetail/ProductDetail";
import productsData from "@/data/products.json";
import {
  getCategoryFallbackSrc,
  getProductImageSrc,
} from "@/utils/productImages";
import { addReviewToProduct, getProductById } from "@/services/productService";

// Este tipo representa los productos locales que vienen desde products.json.
// Se agregan varios campos de imagen porque no todos los productos usan el mismo nombre.
type LocalProduct = ProductDetailItem & {
  category: string;
  description: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnail?: string;
  images?: string[];
  reviews?: ProductReview[];
};

// Este tipo ayuda a leer imágenes que pueden venir desde Supabase.
type RemoteProductImageFields = {
  image?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnail?: string;
  images?: string[];
};

type SubmitReviewData = {
  productId: string | number;
  user?: string;
  rating: number;
  comment: string;
};

const localProducts = productsData as LocalProduct[];

// Esta función entrega reseñas por defecto cuando el producto no tiene reseñas guardadas.
function getDefaultReviews(product: ProductDetailItem): ProductReview[] {
  return [
    {
      user: "Sofia M.",
      rating: Math.max(4, Math.round(product.rating)),
      comment: `I liked the texture and finish of this ${
        product.category?.toLowerCase() ?? "beauty"
      } product.`,
    },
    {
      user: "Camila R.",
      rating: Math.max(4, Math.round(product.rating)),
      comment: "The product feels comfortable and works well for everyday use.",
    },
    {
      user: "Nicole A.",
      rating: Math.max(4, Math.round(product.rating)),
      comment: "Nice presentation, good quality and easy to use.",
    },
  ];
}

// Esta función construye las pestañas visibles del detalle del producto.
function buildTabs(product: ProductDetailItem): DetailTab[] {
  return [
    {
      id: "description",
      label: "Description",
      content:
        product.description ||
        "This product does not have a detailed description yet.",
    },
    {
      id: "details",
      label: "Details",
      content: `Category: ${product.category ?? "Beauty"}.
Brand: ${product.brand}.
Size: ${product.size || "Standard size"}.
Stock: ${product.stock ?? "Available"}.`,
    },
    {
      id: "reviews",
      label: "Reviews",
      content: "Reviews are visible below. You can also add your own review.",
    },
  ];
}

// Esta función une la información del producto remoto con la local.
// La imagen local tiene prioridad porque evita que el detalle muestre una imagen incorrecta.
function buildProductForImage(
  product: ProductDetailItem,
  localProduct?: LocalProduct
) {
  const remoteProduct = product as ProductDetailItem & RemoteProductImageFields;

  return {
    id: product.id,
    brand: product.brand,
    name: product.name,
    title: product.name,
    category: product.category ?? localProduct?.category ?? "Foundation",

    // Primero se intenta usar la imagen del producto local.
    // Si no existe, se usan los campos que pueden venir desde Supabase.
    imageUrl:
      localProduct?.imageUrl ??
      localProduct?.image_url ??
      localProduct?.image ??
      remoteProduct.imageUrl ??
      remoteProduct.image_url ??
      remoteProduct.image ??
      "",

    thumbnail: localProduct?.thumbnail ?? remoteProduct.thumbnail ?? "",
    images: localProduct?.images ?? remoteProduct.images ?? [],
  };
}

// Este componente carga el producto según el productId de la URL.
export default function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState<ProductDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Se busca el producto local para tener respaldo de datos e imagen.
  const localProduct = useMemo(() => {
    return localProducts.find((item) => String(item.id) === String(productId));
  }, [productId]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setProduct(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Primero se intenta cargar desde Supabase.
        const supabaseProduct = await getProductById(productId);

        // Si Supabase responde, se usa ese producto.
        setProduct(supabaseProduct);
      } catch {
        // Si Supabase falla, se usa el producto local.
        setProduct(localProduct ?? null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId, localProduct]);

  // Productos recomendados debajo del detalle.
  const recommendedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return localProducts
      .filter((item) => String(item.id) !== String(product.id))
      .slice(0, 4);
  }, [product]);

  // Esta función guarda una reseña usando el servicio del proyecto.
  async function handleSubmitReview({
    productId: reviewProductId,
    rating,
    comment,
  }: SubmitReviewData) {
    return addReviewToProduct({
      productId: reviewProductId,
      text: comment,
      rating,
    });
  }

  if (isLoading) {
    return (
      <ProductDetailPage
        product={null}
        notFoundTitle="Loading product..."
        notFoundMessage="Please wait while we load the product details."
        notFoundLinkText="Back to products"
        notFoundLinkHref="/products"
      />
    );
  }

  const tabs = product ? buildTabs(product) : [];

  // Aquí se prepara la imagen principal del producto.
  // Esto evita que salga una imagen hardcodeada o una imagen aleatoria.
  const imageProduct = product
    ? buildProductForImage(product, localProduct)
    : null;

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      backLinkHref="/products"
      backLinkLabel="← Back to products"
      notFoundTitle="Product not found"
      notFoundMessage="The product you are looking for does not exist."
      notFoundLinkText="Back to products"
      notFoundLinkHref="/products"
      reviewToggleLabel="Write a review"
      reviewSubmitLabel="Publish review"
      reviewPlaceholder="Share your experience with this product..."
      onSubmitReview={handleSubmitReview}
      initialReviews={
        product?.reviews && product.reviews.length > 0
          ? product.reviews
          : product
            ? getDefaultReviews(product)
            : []
      }
      getInitialReviews={(selected) =>
        selected.reviews && selected.reviews.length > 0
          ? selected.reviews
          : getDefaultReviews(selected)
      }
      imageSrc={imageProduct ? getProductImageSrc(imageProduct) : ""}
      imageFallbackSrc={(selected) => getCategoryFallbackSrc(selected)}
      imageReferrerPolicy="no-referrer"
      galleryVariant="cover"
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item)}
      getRecommendedImageFallbackSrc={(item) => getCategoryFallbackSrc(item)}
      recommendedImageReferrerPolicy="no-referrer"
    />
  );
}
