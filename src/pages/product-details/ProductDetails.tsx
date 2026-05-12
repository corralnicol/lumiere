import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
  type ProductDetailItem,
  type ProductReview,
} from "@/components/ProductDetail/ProductDetail";
import productsData from "@/data/products.json";
import { getProductImageSrc } from "@/utils/productImages";

type Product = ProductDetailItem & {
  category: string;
  description: string;
  reviews?: ProductReview[];
};

const products = productsData as Product[];

function getDefaultReviews(product: Product): ProductReview[] {
  return [
    {
      user: "Sofia M.",
      rating: Math.max(4, Math.round(product.rating)),
      comment: `I liked the texture and finish of this ${product.category.toLowerCase()} product.`,
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

export default function ProductDetails() {
  const { productId } = useParams();
  const product = products.find((item) => String(item.id) === String(productId));

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
        content: `Category: ${product.category}. Brand: ${product.brand}. Size: ${product.size || "Standard size"
          }. Stock: ${product.stock ?? "Available"}.`,
      },
      {
        id: "reviews",
        label: "Reviews",
        content: "Reviews are visible below. You can also add your own review.",
      },
    ]
    : [];

  const recommendedProducts = product
    ? products
      .filter((item) => String(item.id) !== String(product.id))
      .slice(0, 4)
    : [];

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      storageKeyPrefix="lumiere-product-reviews"
      getInitialReviews={(selected) =>
        selected.reviews && selected.reviews.length > 0
          ? selected.reviews
          : getDefaultReviews(selected)
      }
      imageSrc={product ? getProductImageSrc(product) : ""}
      imageFallbackSrc={(selected) =>
        `https://picsum.photos/900/900?random=${selected.id}`
      }
      imageReferrerPolicy="no-referrer"
      galleryVariant="cover"
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item as Product)}
      getRecommendedImageFallbackSrc={(item) =>
        `https://picsum.photos/300/300?random=${item.id}`
      }
      recommendedImageReferrerPolicy="no-referrer"
    />
  );
}
