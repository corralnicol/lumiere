import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { homeBestSellers } from "../../data/homeContent";
import { supabase } from "@/lib/supabase";
import { useUserState } from "@/contexts/user/UserContext";

type BestSellersProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function BestSellers({ onFeedback }: BestSellersProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const user = useUserState();

  // Cargar los favoritos desde el perfil del usuario al iniciar
  useEffect(() => {
    if (user?.isLoggedIn && user?.id) {
      const fetchFavorites = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("favorites")
          .eq("id", user.id)
          .single();

        if (data && Array.isArray(data.favorites)) {
          setFavoriteIds(data.favorites as string[]);
        }
      };
      fetchFavorites();
    } else {
      setFavoriteIds([]); // Limpiar favoritos si no hay sesión
    }
  }, [user?.isLoggedIn, user?.id]);

  const toggleFavorite = async (
    event: React.MouseEvent<HTMLButtonElement>,
    productId: string,
    itemName: string
  ) => {
    event.preventDefault();

    if (!user?.isLoggedIn) {
      onFeedback("Inicia sesión para guardar tus favoritos.", "warning");
      return;
    }

    const isFavorite = favoriteIds.includes(productId);
    const newFavoriteIds = isFavorite
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];

    // Optimistic UI Update (se actualiza visualmente de inmediato)
    setFavoriteIds(newFavoriteIds);
    if (isFavorite) {
      onFeedback(`${itemName} eliminado de favoritos.`, "info");
    } else {
      onFeedback(`${itemName} añadido a favoritos.`, "success");
    }

    // Actualizar directamente la tabla profiles
    const { error } = await supabase
      .from("profiles")
      .update({ favorites: newFavoriteIds })
      .eq("id", user.id);
    
    if (error) {
      console.error("Error al actualizar favoritos en Supabase:", error);
      // Revertir el estado si falla
      setFavoriteIds(favoriteIds);
    }
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