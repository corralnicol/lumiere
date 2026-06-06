// Este componente muestra el detalle de un producto best seller.
// También evita que los recomendados usen imágenes aleatorias.

import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
} from "../../components/ProductDetail/ProductDetail";
import { bestSellerProducts } from "../../data/bestSellerProducts";
import productsData from "../../data/products.json";
import {
  getCategoryFallbackSrc,
  getProductImageSrc,
} from "../../utils/productImages";

type JsonProduct = {
  id: number | string;
  category: string;
  brand: string;
  name: string;
  image?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnail?: string;
  images?: string[];
  rating: number;
  price: number;
};

const jsonProducts = productsData as JsonProduct[];

export default function BestSellerDetails() {
  const { productId } = useParams();

  // Busca el producto best seller según el id que viene en la URL.
  const product = bestSellerProducts.find((item) => item.id === productId);

  // Tabs del detalle del producto.
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

  // Productos recomendados del catálogo general.
  const recommendedProducts = jsonProducts.slice(0, 4);

  return (
    <ProductDetailPage
      product={product}
      tabs={tabs}
      storageKeyPrefix="lumiere-reviews"
      initialReviews={product?.reviews}
      reviewCountBase={product?.reviewCount}

      // Imagen principal del best seller.
      // Se usa el helper para evitar imágenes rotas o aleatorias.
      imageSrc={product ? getProductImageSrc(product) : ""}
      imageFallbackSrc={(selected) => getCategoryFallbackSrc(selected)}
      imageReferrerPolicy="no-referrer"

      // Recomendados.
      // Antes aquí había picsum.photos, por eso salían imágenes aleatorias.
      recommendedProducts={recommendedProducts}
      getRecommendedImageSrc={(item) => getProductImageSrc(item)}
      getRecommendedImageFallbackSrc={(item) => getCategoryFallbackSrc(item)}
      recommendedImageReferrerPolicy="no-referrer"
    />
  );
}