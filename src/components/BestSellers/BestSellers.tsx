import { useState } from "react";
import { Link } from "react-router-dom";
import { homeBestSellers } from "../../data/homeContent";
import products from "@/data/products.json";
import { getProductImageSrc } from "@/utils/productImages";

type BestSellersProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function computeStars(reviews: { rating: number }[]): number {
  if (!reviews.length) return 0;
  return Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length);
}

function BestSellers({ onFeedback }: BestSellersProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const toggleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>,
    productId: string,
    itemName: string
  ) => {
    event.preventDefault();

    const isFavorite = favoriteIds.includes(productId);

    if (isFavorite) {
      setFavoriteIds((currentIds) => currentIds.filter((id) => id !== productId));
      onFeedback(`${itemName} removed from favorites.`, "info");
      return;
    }

    setFavoriteIds((currentIds) => [...currentIds, productId]);
    onFeedback(`${itemName} added to favorites.`, "success");
  };

  return (
    <section className="best-seller-section" id="best-sellers">
      <h2 className="best-seller-title">Best Sellers</h2>

      <div className="best-seller-grid">
        {homeBestSellers.map((entry) => {
          const product = products.find((p) => p.id === entry.id);
          if (!product) return null;

          const isFavorite = favoriteIds.includes(product.id);
          const stars = computeStars(product.reviews);
          const searchTarget = [product.brand, product.name, product.category]
            .filter(Boolean)
            .join(" ");

          return (
            <Link
              to={`/products/${product.id}`}
              className="best-card"
              data-search-target={searchTarget}
              key={product.id}
            >
              <div className="best-card-image-box">
                <button
                  className={`best-card-fav ${isFavorite ? "is-active" : ""}`}
                  type="button"
                  aria-label={
                    isFavorite
                      ? `Eliminar ${product.name} de favoritos`
                      : `Añadir ${product.name} a favoritos`
                  }
                  aria-pressed={isFavorite}
                  onClick={(event) =>
                    toggleFavorite(event, product.id, product.name)
                  }
                >
                  <i
                    className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-heart`}
                    aria-hidden="true"
                  ></i>
                </button>

                <img
                  src={getProductImageSrc(product)}
                  alt={product.name}
                  className={`best-card-image ${entry.imageClassName}`}
                />

                <div className="best-card-stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <i
                      className={
                        index < stars
                          ? "fa-solid fa-star"
                          : "fa-regular fa-star"
                      }
                      aria-hidden="true"
                      key={index}
                    ></i>
                  ))}
                </div>
              </div>

              <div className="best-card-info">
                <h3 className="best-card-name">{product.brand}</h3>
                <p className="best-card-desc">{product.name}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );

}

export default BestSellers;
