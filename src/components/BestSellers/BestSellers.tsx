import { Link } from "react-router-dom";
import { homeBestSellers } from "../../data/homeContent";
import { useProductsByIds } from "@/hooks/useProducts";
import { getProductImageSrc } from "@/utils/productImages";
import { useFavoritesState, useFavoritesActions } from "@/contexts/favorites/FavoritesContext";
import { useUserState } from "@/contexts/user/UserContext";

type BestSellersProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

const bestSellerIds = homeBestSellers.map((e) => e.id);

function BestSellers({ onFeedback }: BestSellersProps) {
  const { data: products, loading, error } = useProductsByIds(bestSellerIds);
  const { ids } = useFavoritesState();
  const actions = useFavoritesActions();
  const user = useUserState();

  const handleToggle = async (
    event: React.MouseEvent<HTMLButtonElement>,
    productId: string,
    itemName: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user.isLoggedIn) {
      onFeedback("Sign in to save favorites.", "info");
      return;
    }
    const isFav = ids.includes(productId);
    try {
      await actions?.toggle(productId);
      onFeedback(
        isFav ? `${itemName} removed from favorites.` : `${itemName} added to favorites.`,
        isFav ? "info" : "success"
      );
    } catch {
      onFeedback("Could not update favorites.", "warning");
    }
  };

  return (
    <section className="best-seller-section" id="best-sellers">
      <h2 className="best-seller-title">Best Sellers</h2>

      {error ? (
        <p className="products-error">Could not load best sellers.</p>
      ) : loading ? (
        <div className="best-seller-grid best-seller-grid--loading" aria-busy="true">
          <span className="activity-spinner" aria-hidden="true"></span>
        </div>
      ) : (
        <div className="best-seller-grid">
          {homeBestSellers.map((entry) => {
            const product = products.find((p) => p.id === entry.id);
            if (!product) return null;

            const isFavorite = ids.includes(product.id);
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
                      handleToggle(event, product.id, product.name)
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
                          index < product.rating
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
      )}
    </section>
  );
}

export default BestSellers;
