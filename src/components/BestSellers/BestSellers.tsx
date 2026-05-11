import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { homeBestSellers } from "../../data/homeContent";


type BestSellersProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function BestSellers({ onFeedback }: BestSellersProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const toggleFavorite = (productId: string, itemName: string) => {
    const isFavorite = favoriteIds.includes(productId);

    if (isFavorite) {
      setFavoriteIds((currentIds) => currentIds.filter((id) => id !== productId));
      onFeedback(`${itemName} removed from favorites.`, "info");
      return;
    }

    setFavoriteIds((currentIds) => [...currentIds, productId]);
    onFeedback(`${itemName} added to favorites.`, "success");
  };

  const { addToCart } = useCart();

  // Función para manejar cuando se agrega al carrito
  const handleAddToCart = (product: any) => {
    // Adaptamos el objeto del home al formato que espera el carrito
    const productToAdd = {
      id: parseInt(product.id.toString().replace(/\D/g, '')) || Math.floor(Math.random() * 1000),
      category: "Best Seller",
      brand: product.brand,
      name: product.itemName || product.description.split(' ').slice(0, 3).join(' '),
      description: product.description,
      imageUrl: product.src,
      rating: product.stars,
      price: 25.00, // Precio fijo de ejemplo para los best sellers
      size: "Estándar",
      stock: 50
    };
    
    addToCart(productToAdd);
    onFeedback(`${productToAdd.name} añadido al carrito`, "success");
  };

  return (
    <section className="best-seller-section" id="best-sellers">
      <h2 className="best-seller-title">Best Sellers</h2>

      <div className="best-seller-grid">
        {homeBestSellers.map((product) => {
          const isFavorite = favoriteIds.includes(product.id);

          return (
            <article
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
                  onClick={() => toggleFavorite(product.id, product.itemName)}
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
                
                {/* Botón para añadir al carrito */}
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <i className="fa-solid fa-cart-plus"></i>
                  Agregar al Carrito
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );

}

export default BestSellers;