// este componente es el encargado de mostrar los detalles de un producto específico.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
  type ProductDetailItem,
  type ProductReview,
} from "@/components/ProductDetail/ProductDetail";
import productsData from "@/data/products.json";
import { getProductImageSrc } from "@/utils/productImages";
import { getProductById } from "@/services/productService";

// aqui defino el tipo LocalProduct que extiende de ProductDetailItem y agrega algunos campos adicionales como category, description y reviews.

type LocalProduct = ProductDetailItem & {
  category: string;
  description: string;
  reviews?: ProductReview[];
};

const localProducts = productsData as LocalProduct[];

// esta funcion se encarga de proporcionar reseñas predeterminadas para un producto, en caso de que no tenga reseñas reales en la base de datos. 

function getDefaultReviews(product: ProductDetailItem): ProductReview[] {
  return [
    {
      user: "Sofia M.",
      rating: Math.max(4, Math.round(product.rating)),
      comment: `I liked the texture and finish of this ${product.category?.toLowerCase() ?? "beauty"} product.`,
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

// en esta funcion se construyen las pestañas de detalles del producto, incluyendo la descripción, los detalles y las reseñas.

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

// en esta funcion se obtiene el productId de la URL, se carga el producto desde la base de datos de Supabase o desde los productos locales.

export default function ProductDetails() {
  const { productId } = useParams();

  const [product, setProduct] = useState<ProductDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        const supabaseProduct = await getProductById(productId);
        setProduct(supabaseProduct);
      } catch {
        setProduct(localProduct ?? null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId, localProduct]);

  const recommendedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return localProducts
      .filter((item) => String(item.id) !== String(product.id))
      .slice(0, 4);
  }, [product]);

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
      imageSrc={
        product
          ? getProductImageSrc({
              id: product.id,
              brand: product.brand,
              name: product.name,
              category: product.category ?? "Beauty",
              imageUrl: product.imageUrl,
            })
          : ""
      }
      imageFallbackSrc={(selected) =>
        `/images/categories/${selected.category?.toLowerCase() ?? "foundation"}.png`
      }
      imageReferrerPolicy="no-referrer"
      galleryVariant="cover"
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item as LocalProduct)}
      getRecommendedImageFallbackSrc={(item) =>
        `https://picsum.photos/300/300?random=${item.id}`
      }
      recommendedImageReferrerPolicy="no-referrer"
    />
  );
}
