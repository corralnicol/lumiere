import { useParams } from "react-router-dom";
import ProductDetailPage, {
  type DetailTab,
} from "../../components/ProductDetail/ProductDetail";
import { kitProducts } from "../../data/kitProducts";

export default function KitDetails() {
  const { kitId } = useParams();
  const kit = kitProducts.find((item) => item.id === kitId);

  const tabs: DetailTab[] = kit
    ? [
      {
        id: "description",
        label: "Description",
        content: kit.details.description,
      },
      {
        id: "howToUse",
        label: "How to use",
        content: kit.details.howToUse,
      },
      {
        id: "ingredients",
        label: "Ingredients",
        content: kit.details.ingredients,
      },
    ]
    : [];

  const recommendedKits = kit
    ? kitProducts.filter((item) => item.id !== kit.id).slice(0, 4)
    : [];

  return (
    <ProductDetailPage
      product={kit}
      tabs={tabs}
      storageKeyPrefix="lumiere-kit-reviews"
      initialReviews={kit?.reviews}
      reviewCountBase={kit?.reviewCount}
      imageSrc={kit?.image}
      notFoundTitle="Kit not found"
      notFoundMessage="The kit you are looking for does not exist."
      characteristicsLabel="Kit characteristics"
      reviewPlaceholder="Write your opinion about this kit"
      recommendedProducts={recommendedKits}
      getRecommendedLink={(item) => `/kits/${item.id}`}
      getRecommendedImageSrc={(item) => item.image ?? ""}
    />
  );
}