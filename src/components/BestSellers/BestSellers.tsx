import { useState } from "react";
import { Link } from "react-router-dom";
import { homeBestSellers } from "../../data/homeContent";


type BestSellersProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

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
        {homeBestSellers.map((product) => {
          const isFavorite = favoriteIds.includes(product.id);

          return (
            <Link
              to={`/best-sellers/${product.id}`}
              className="best-card"
              data-search-target={product.searchTarget}
              key={product.id}
            >
              <div className="best-card-image-box">
                {/* Botón de favoritos */}
                <button
                  className={`best-card-fav ${isFavorite ? "is-active" : ""}`}
                  type="button"
                  aria-label={
                    isFavorite
                      ? `Eliminar ${product.itemName} de favoritos`
                      : `Añadir ${product.itemName} a favoritos`
                  }
                  aria-pressed={isFavorite}
                  onClick={(event) =>
                    toggleFavorite(event, product.id, product.itemName)
                  }
                >
                  <i
                    className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-heart`}
                    aria-hidden="true"
                  ></i>
                </button>

                <img
                  src={product.src}
                  alt={product.alt}
                  className={`best-card-image ${product.imageClassName}`}
                />

                {/* Estrellas de calificación */}
                <div className="best-card-stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <i
                      className={
                        index < product.stars
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
                <p className="best-card-desc">{product.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );

}

export default BestSellers;