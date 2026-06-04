import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { ProductCard } from "@/components/ProductCard";
import productsData from "@/data/products.json";
import { bestSellerProducts } from "@/data/bestSellerProducts";
import { useUserState } from "@/contexts/user/UserContext";
import { supabase } from "@/lib/supabase";
import { type Product, hasRequiredFields } from "@/types/products";
import { kitProducts } from "@/data/kitProducts";
import "./Favorites.css";

const rawProducts = productsData as Product[];
const allProducts = rawProducts.filter(hasRequiredFields);

export default function Favorites() {
  const user = useUserState();
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: "", type: "", isVisible: false });

  const showFeedback = (message: string, type: "info" | "success" | "warning" = "info") => {
    setFeedback({ message, type, isVisible: true });
    setTimeout(() => setFeedback((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  useEffect(() => {
    if (!user.loading) {
      if (!user.isLoggedIn) {
        navigate("/auth/sign-in");
        return;
      }
      
      const fetchFavorites = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("favorites")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          const favIds = (data?.favorites as string[]) || [];
          setFavoriteIds(favIds);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    }
  }, [user.isLoggedIn, user.loading, user.id, navigate]);

  const toggleFavorite = async (
    event: React.MouseEvent<HTMLButtonElement>,
    productId: string,
    itemName: string
  ) => {
    event.preventDefault();

    const isFavorite = favoriteIds.includes(productId);
    const newFavoriteIds = isFavorite
      ? favoriteIds.filter((id) => id !== productId)
      : [...favoriteIds, productId];

    // Optimistic UI Update
    setFavoriteIds(newFavoriteIds);
    if (isFavorite) {
      showFeedback(`${itemName} removed from favorites.`, "info");
    } else {
      showFeedback(`${itemName} added to favorites.`, "success");
    }

    const { error } = await supabase
      .from("profiles")
      .update({ favorites: newFavoriteIds })
      .eq("id", user.id);
    
    if (error) {
      console.error("Error toggling favorite:", error);
      // Revertir el estado si falla
      setFavoriteIds(favoriteIds);
    }
  };

  const favoriteBestSellersMapped: Product[] = bestSellerProducts
    .filter(p => favoriteIds.includes(p.id))
    .map(p => ({
      id: p.id,
      category: "Best Seller" as any,
      brand: p.brand,
      name: p.name,
      description: p.description,
      rating: p.rating,
      price: p.price,
      size: p.size,
      stock: p.stock,
      imageUrl: p.image,
      characteristics: p.characteristics as any[],
      reviews: p.reviews.map(r => ({ user: r.user, rating: r.rating, comment: r.comment }))
    }));

  const favoriteKitsMapped: Product[] = kitProducts
    .filter(p => favoriteIds.includes(p.id))
    .map(p => ({
      id: p.id,
      category: "Kit" as any,
      brand: p.brand,
      name: p.name,
      description: p.description,
      rating: p.rating,
      price: p.price,
      size: p.size,
      stock: p.stock,
      imageUrl: p.image,
      characteristics: p.characteristics as any[],
      reviews: p.reviews.map(r => ({ user: r.user, rating: r.rating, comment: r.comment }))
    }));

  const favoriteNormalProducts = allProducts.filter(p => favoriteIds.includes(String(p.id)));

  const allFavoritesCombined = [
    ...favoriteBestSellersMapped,
    ...favoriteNormalProducts,
    ...favoriteKitsMapped
  ];

  return (
    <>
      <Header onFeedback={showFeedback} />
      
      <div
        className={`interaction-feedback ${feedback.isVisible ? "is-visible" : ""}`}
        data-state={feedback.type}
        role="status"
      >
        {feedback.message}
      </div>

      <main className="favorites-page">
        <div className="favorites-header">
          <h2>Your Favorites</h2>
          <p>The products you love, saved in one place.</p>
        </div>

        {loading ? (
          <div className="favorites-loading">Loading your favorites...</div>
        ) : favoriteIds.length === 0 ? (
          <div className="favorites-empty">
            <i className="fa-regular fa-heart"></i>
            <h3>No favorites yet</h3>
            <p>You haven't saved any products to your favorites.</p>
            <Link to="/products" className="continue-btn">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {allFavoritesCombined.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isFavorite={true}
                onToggleFavorite={(id, event) => toggleFavorite(event, id, product.name)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
}
