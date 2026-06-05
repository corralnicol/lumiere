import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
} from "@/components/ProductDetail/ProductDetail";
import productsJson from "@/data/products.json";
import { getProductImageSrc } from "@/utils/productImages";
import type { Product } from "@/types/products";
import { useMemo } from "react";

const products = productsJson as Product[];

export default function ProductDetails() {
  const { productId } = useParams();
  const product = useMemo(() => {
    const found = products.find((item) => item.id === productId);
    if (!found) return null;
    return {
      ...found,
      rating: Math.round(
        found.reviews.reduce((sum, review) => sum + review.rating, 0) / found.reviews.length
      ),
    };
  }, [productId]);

  const tabs: DetailTab[] = product
    ? [
      {
        id: "description",
        label: "Description",
        content: product.description,
      },
      {
        id: "details",
        label: "Details",
        content: `Category: ${product.category ?? "Kit"}. Brand: ${product.brand}. Size: ${product.size || "Standard size"}. Stock: ${product.stock}.`,
      },
      {
        id: "reviews",
        label: "Reviews",
        content: "Reviews are visible below. You can also add your own review.",
      },
    ]
    : [];

  const recommendedProducts = products
    .filter((item) => item.id !== product?.id)
    .slice(0, 4)
    .map((p) => ({
      ...p,
      rating: Math.round(
        p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length,
      ),
    }));

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      storageKeyPrefix="lumiere-product-reviews"
      imageSrc={product ? getProductImageSrc(product) : ""}
      imageFallbackSrc={(selected) =>
        `https://picsum.photos/900/900?random=${selected.id}`
      }
      imageReferrerPolicy="no-referrer"
      galleryVariant="cover"
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item)}
      getRecommendedImageFallbackSrc={(item) =>
        `https://picsum.photos/300/300?random=${item.id}`
      }
      recommendedImageReferrerPolicy="no-referrer"
    />
  );
}
