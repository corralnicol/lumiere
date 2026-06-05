import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
} from "@/components/ProductDetail/ProductDetail";
import { bestSellerProducts } from "../../data/bestSellerProducts";
import products from "@/data/products.json";
import { getProductImageSrc } from "../../utils/productImages";
import { useMemo } from "react";

export default function BestSellerDetails() {
  const { productId } = useParams();
  const product = bestSellerProducts.find((item) => item.id === productId);

  const tabs: DetailTab[] = product
    ? [
      {
        id: "description",
        label: "Description",
        content: product.details.description,
      },
      {
        id: "howToUse",
        label: "How to use",
        content: product.details.howToUse,
      },
      {
        id: "ingredients",
        label: "Ingredients",
        content: product.details.ingredients,
      },
    ]
    : [];

  const recommendedProducts = products.slice(0, 4).map((p) => ({
    ...p,
    rating: useMemo(() => Math.round(p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length), [p.reviews]),
  }));

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      storageKeyPrefix="lumiere-reviews"
      initialReviews={product?.reviews}
      reviewCountBase={product?.reviewCount}
      imageSrc={product?.image}
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item)}
      getRecommendedImageFallbackSrc={(item) =>
        `https://picsum.photos/300/300?random=${item.id}`
      }
    />
  );
}