import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getProductImageSrc } from "@/utils/productImages";
import type { Product } from "@/types/products";
import { categories } from "@/data/categories";
import { useFavoritesState, useFavoritesActions } from "@/contexts/favorites/FavoritesContext";
import { useUserState } from "@/contexts/user/UserContext";

const buildSearchTarget = (product: Product) => {
    return [
        product.brand,
        product.name,
        product.category,
        product.description,
    ]
        .filter(Boolean)
        .join(" ");
};

const getCategoryLabel = (categoryId: string | null): string => {
    if (!categoryId) return "Kit";
    return categories.find(c => c.id === categoryId)?.label ?? categoryId;
};

type FeedbackType = "info" | "success" | "warning";

export function ProductCard({
    product,
    index,
    onFeedback,
}: {
    product: Product;
    index?: number;
    onFeedback?: (msg: string, type?: FeedbackType) => void;
}) {
    const sizeLabel = product.size || "Standard size";
    const stockLabel = product.stock > 0 ? `${product.stock} left` : "Unavailable";
    const stockState = product.stock <= 20 ? "low" : "ok";
    const rating = product.rating ?? 0;
    const user = useUserState();
    const { ids } = useFavoritesState();
    const actions = useFavoritesActions();
    const isFav = ids.includes(product.id);

    const handleFavClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user.isLoggedIn) {
            onFeedback?.("Sign in to save favorites.", "info");
            return;
        }
        try {
            await actions?.toggle(product.id);
            onFeedback?.(
                isFav ? `${product.name} removed from favorites.` : `${product.name} added to favorites.`,
                isFav ? "info" : "success"
            );
        } catch {
            onFeedback?.("Could not update favorites.", "warning");
        }
    };

    return (
        <Link
            to={`/products/${product.id}`}
            className="product-card"
            data-search-target={buildSearchTarget(product)}
            style={{ animationDelay: `${index ?? 1} * 0.04}s` } as CSSProperties}
        >
            <div className="product-card-media">
                <span className="product-card-tag">
                    {getCategoryLabel(product.category)}
                </span>
                <button
                    type="button"
                    className={`product-card-fav${isFav ? " is-active" : ""}`}
                    aria-label={isFav ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                    aria-pressed={isFav}
                    onClick={handleFavClick}
                >
                    <i className={`${isFav ? "fa-solid" : "fa-regular"} fa-heart`} aria-hidden="true" />
                </button>
                <img
                    src={getProductImageSrc(product)}
                    alt={product.name}
                />
            </div>

            <div className="product-card-body">
                <h3>{product.brand}</h3>
                <p className="product-card-name">{product.name}</p>

                <div
                    className="product-card-rating"
                    aria-label={`${rating} stars`}
                >
                    <div className="product-card-stars">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <i
                                className={
                                    index < Math.round(rating)
                                        ? "fa-solid fa-star"
                                        : "fa-regular fa-star"
                                }
                                aria-hidden="true"
                                key={index}
                            ></i>
                        ))}
                    </div>
                    <span>{rating.toFixed(1)}</span>
                </div>

                <div className="product-card-footer">
                    <span className="product-card-price">
                        ${Number(product.price).toFixed(2)}
                    </span>
                </div>

                <div className="product-card-badges">
                    <span>{sizeLabel}</span>
                    <span className="product-card-stock" data-state={stockState}>
                        {stockLabel}
                    </span>
                </div>
            </div>
        </Link>
    );
}