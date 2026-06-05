import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
} from "@/components/ProductDetail/ProductDetail";
import { getProductImageSrc, getFallbackImageByCategory } from "@/utils/productImages";
import { useProduct, useProducts } from "@/hooks/useProducts";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function ProductDetails() {
  const { productId } = useParams();
  const { data: product, loading, error } = useProduct(productId);
  const { data: allProducts } = useProducts();

  const showFeedback = () => {};

  if (loading) {
    return (
      <>
        <Header onFeedback={showFeedback} />
        <main className="product-detail-empty" role="status" aria-live="polite">
          <span className="activity-spinner" aria-hidden="true"></span>
          <span>Loading product…</span>
        </main>
        <Footer onFeedback={showFeedback} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header onFeedback={showFeedback} />
        <main className="product-detail-empty">
          <h1>Could not load product</h1>
          <p>{error}</p>
        </main>
        <Footer onFeedback={showFeedback} />
      </>
    );
  }

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

  const recommendedProducts = allProducts
    .filter((item) => item.id !== product?.id)
    .slice(0, 4);

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      storageKeyPrefix="lumiere-product-reviews-v2"
      imageSrc={product ? getProductImageSrc(product) : ""}
      imageFallbackSrc={(selected) =>
        getFallbackImageByCategory(selected.category ?? null)
      }
      galleryVariant="cover"
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item)}
      getRecommendedImageFallbackSrc={(item) =>
        getFallbackImageByCategory(item.category ?? null)
      }
    />
  );
}
