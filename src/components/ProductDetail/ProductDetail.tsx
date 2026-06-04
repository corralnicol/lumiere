import { Link, useNavigate } from "react-router-dom";
import {
    useEffect,
    useRef,
    useState,
    type ImgHTMLAttributes,
    type SubmitEvent,
} from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./ProductDetail.css";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useUserState } from "@/contexts/user/UserContext";

type FeedbackType = "info" | "success" | "warning";
export type ProductReview = {
    user: string;
    rating: number;
    comment: string;
};

export type DetailTab = {
    id: string;
    label: string;
    content: string;
};

export type ProductDetailItem = {
    id: number | string;
    category?: string;
    brand: string;
    name: string;
    description?: string;
    image?: string;
    imageUrl?: string;
    rating: number;
    price: number;
    size?: string;
    stock?: number;
    characteristics?: string[];
    reviews?: ProductReview[];
};

export type RecommendedProduct = {
    id: number | string;
    brand: string;
    name: string;
    rating: number;
    price: number;
    image?: string;
    imageUrl?: string;
};

type ProductDetailPageProps<
    T extends ProductDetailItem = ProductDetailItem,
    R extends RecommendedProduct = RecommendedProduct
> = {
    product?: T | null;
    tabs?: DetailTab[];
    storageKeyPrefix?: string;
    initialReviews?: ProductReview[];
    getInitialReviews?: (product: T) => ProductReview[];
    reviewCountBase?: number;
    backLinkHref?: string;
    backLinkLabel?: string;
    notFoundTitle?: string;
    notFoundMessage?: string;
    notFoundLinkText?: string;
    notFoundLinkHref?: string;
    galleryVariant?: "default" | "cover";
    imageSrc?: string;
    imageFallbackSrc?: string | ((product: T) => string);
    imageReferrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
    characteristicsLabel?: string;
    reviewsTitle?: string;
    reviewToggleLabel?: string;
    reviewSubmitLabel?: string;
    reviewPlaceholder?: string;
    recommendedProducts?: R[];
    getRecommendedLink?: (item: R) => string;
    getRecommendedImageSrc?: (item: R) => string;
    getRecommendedImageFallbackSrc?: (item: R) => string;
    recommendedImageReferrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
};

const DEFAULT_REVIEW_PLACEHOLDER = "Write your opinion about this product";

function formatCharacteristic(characteristic: string) {
    return characteristic
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function resolveFallback<T>(
    fallback: string | ((value: T) => string) | undefined,
    value: T
) {
    if (!fallback) {
        return "";
    }

    return typeof fallback === "function" ? fallback(value) : fallback;
}

export default function ProductDetailPage<
    T extends ProductDetailItem,
    R extends RecommendedProduct = RecommendedProduct
>({
    product,
    storageKeyPrefix = "lumiere-product-reviews",
    initialReviews,
    getInitialReviews,
    reviewCountBase,
    backLinkHref = "/",
    backLinkLabel = "← Back",
    notFoundTitle = "Product not found",
    notFoundMessage = "The product you are looking for does not exist.",
    notFoundLinkText = "Back to home",
    notFoundLinkHref = "/",
    galleryVariant = "default",
    imageSrc,
    imageFallbackSrc,
    imageReferrerPolicy,
    characteristicsLabel = "Product characteristics",
    reviewsTitle = "Reviews",
    reviewToggleLabel = "add yours",
    reviewSubmitLabel = "Submit review",
    reviewPlaceholder = DEFAULT_REVIEW_PLACEHOLDER,
    recommendedProducts = [],
    getRecommendedLink = (item) => `/products/${item.id}`,
    getRecommendedImageSrc,
    getRecommendedImageFallbackSrc,
    recommendedImageReferrerPolicy,
}: ProductDetailPageProps<T, R>) {
    const [quantity, setQuantity] = useState(1);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");
    const user = useUserState();
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    useEffect(() => {
        if (user?.isLoggedIn && user?.id) {
            const fetchFavorites = async () => {
                const { data } = await supabase
                    .from("profiles")
                    .select("favorites")
                    .eq("id", user.id!)
                    .single();

                if (data && Array.isArray(data.favorites)) {
                    setFavoriteIds(data.favorites as string[]);
                }
            };
            fetchFavorites();
        } else {
            const timer = setTimeout(() => {
                setFavoriteIds([]);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user?.isLoggedIn, user?.id]);

    const isFavorite = product ? favoriteIds.includes(String(product.id)) : false;

    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const handleToggleFavorite = async () => {
        if (!product) return;
        
        if (!user?.isLoggedIn) {
            showFeedback("Inicia sesión para guardar tus favoritos.", "warning");
            return;
        }

        const nextFavoriteIds = isFavorite
            ? favoriteIds.filter((id) => id !== String(product.id))
            : [...favoriteIds, String(product.id)];

        // Optimistic UI Update
        setFavoriteIds(nextFavoriteIds);

        if (isFavorite) {
            showFeedback(`${product.name} removed from favorites.`, "info");
        } else {
            showFeedback(`${product.name} added to favorites.`, "success");
        }

        let success = false;
        let updatedFavs = nextFavoriteIds;
        const productIdStr = String(product.id);

        if (isUuid(productIdStr)) {
            const { data, error } = await supabase.rpc("toggle_favorite", {
                p_product_id: productIdStr,
            });
            if (!error && data && Array.isArray(data)) {
                success = true;
                updatedFavs = data as string[];
            } else {
                console.error("Error toggling favorite via RPC:", error);
            }
        } else {
            const { error } = await supabase
                .from("profiles")
                .update({ favorites: nextFavoriteIds })
                .eq("id", user.id!);
            if (!error) {
                success = true;
            } else {
                console.error("Error updating favorites directly:", error);
            }
        }

        if (success) {
            setFavoriteIds(updatedFavs);
        } else {
            setFavoriteIds(favoriteIds); // Revertir
        }
    };

    const [baseReviews, setBaseReviews] = useState<ProductReview[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [reviewUser, setReviewUser] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const navigate = useNavigate();

    const getInitialReviewsRef = useRef(getInitialReviews);

    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: Number(product!.id),
            category: product!.category ?? "",
            brand: product!.brand,
            name: product!.name,
            description: product!.description ?? "",
            imageUrl: product!.imageUrl ?? product!.image ?? "",
            rating: product!.rating,
            price: product!.price,
            size: product!.size ?? "",
            stock: product!.stock ?? 0,
        });
        showFeedback(`${quantity} ${product!.name} added to cart.`, "success");
    };

    useEffect(() => {
        getInitialReviewsRef.current = getInitialReviews;
    }, [getInitialReviews]);

    const productId = product?.id;

    useEffect(() => {
        if (productId == null) {
            return;
        }

        const timer = setTimeout(() => {
            setQuantity(1);
            setIsReviewFormOpen(false);
            setReviewUser("");
            setReviewRating(5);
            setReviewComment("");
        }, 0);
        return () => clearTimeout(timer);
    }, [productId]);

    useEffect(() => {
        if (productId == null || !product) {
            return;
        }

        const resolvedBaseReviews =
            getInitialReviewsRef.current?.(product) ??
            initialReviews ??
            product.reviews ??
            [];

        setBaseReviews(resolvedBaseReviews);

        const storageKey = `${storageKeyPrefix}-${productId}`;
        const savedReviews = localStorage.getItem(storageKey);

        if (!savedReviews) {
            setReviews(resolvedBaseReviews);
            return;
        }

        try {
            const parsedReviews = JSON.parse(savedReviews) as ProductReview[];

            if (Array.isArray(parsedReviews) && parsedReviews.length > 0) {
                setReviews(parsedReviews);
            } else {
                setReviews(resolvedBaseReviews);
            }
        } catch {
            setReviews(resolvedBaseReviews);
        }
    }, [productId, product, storageKeyPrefix, initialReviews]);

    const showFeedback = (message: string, type: FeedbackType = "info") => {
        setFeedbackMessage(message);
        setFeedbackType(type);

        window.setTimeout(() => {
            setFeedbackMessage("");
        }, 2600);
    };

    const handleReviewSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!product) {
            return;
        }

        const trimmedUser = reviewUser.trim();
        const trimmedComment = reviewComment.trim();

        if (!trimmedUser || !trimmedComment) {
            showFeedback(
                "Please complete your name and review before submitting.",
                "warning"
            );
            return;
        }

        const newReview: ProductReview = {
            user: trimmedUser,
            rating: reviewRating,
            comment: trimmedComment,
        };

        const updatedReviews = [newReview, ...reviews];

        setReviews(updatedReviews);
        localStorage.setItem(
            `${storageKeyPrefix}-${product.id}`,
            JSON.stringify(updatedReviews)
        );

        setReviewUser("");
        setReviewRating(5);
        setReviewComment("");
        setIsReviewFormOpen(false);

        showFeedback("Your review was submitted successfully.", "success");
    };

    const handleBackNavigation = () => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate(backLinkHref);
    };

    if (!product) {
        return (
            <>
                <Header onFeedback={showFeedback} />

                <main className="product-detail-empty">
                    <h1>{notFoundTitle}</h1>
                    <p>{notFoundMessage}</p>
                    <Link to={notFoundLinkHref}>{notFoundLinkText}</Link>
                </main>

                <Footer onFeedback={showFeedback} />
            </>
        );
    }

    const ratingStars = Array.from({ length: 5 }).map((_, index) =>
        index < Math.round(product.rating)
            ? "fa-solid fa-star"
            : "fa-regular fa-star"
    );

    const productCharacteristics = product.characteristics ?? [];

    const reviewCountDisplay =
        typeof reviewCountBase === "number"
            ? reviewCountBase + Math.max(0, reviews.length - baseReviews.length)
            : reviews.length;

    const resolvedImageSrc =
        imageSrc ?? product.image ?? product.imageUrl ?? "";

    const galleryClassName =
        galleryVariant === "cover"
            ? "product-detail-gallery product-detail-gallery--cover"
            : "product-detail-gallery";

    const recommendedImageResolver =
        getRecommendedImageSrc ??
        ((item: R) => item.image ?? item.imageUrl ?? "");

    const category = product.category ?? "uncategorized";

    return (
        <>
            <Header onFeedback={showFeedback} />

            {feedbackMessage && (
                <div
                    className="detail-feedback"
                    data-state={feedbackType}
                    role="status"
                    aria-live="polite"
                >
                    {feedbackMessage}
                </div>
            )}

            <main className="product-detail-page">
                <button
                    type="button"
                    className="detail-back-link"
                    onClick={handleBackNavigation}
                    aria-label={backLinkLabel || "Back"}
                >
                    {backLinkLabel}
                </button>
                <section className="product-detail-hero">
                    <div className={galleryClassName}>
                        <button
                            className={`detail-favorite ${isFavorite ? "is-active" : ""}`}
                            type="button"
                            aria-label={isFavorite ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                            onClick={handleToggleFavorite}
                        >
                            <i className={`${isFavorite ? "fa-solid" : "fa-regular"} fa-heart`} aria-hidden="true"></i>
                        </button>

                        <img
                            src={resolvedImageSrc}
                            alt={product.name}
                            referrerPolicy={imageReferrerPolicy}
                            onError={
                                imageFallbackSrc
                                    ? (event) => {
                                        const fallback = resolveFallback(imageFallbackSrc, product);

                                        if (fallback) {
                                            event.currentTarget.src = fallback;
                                        }
                                    }
                                    : undefined
                            }
                        />
                    </div>

                    <div className="product-detail-info">
                        <p className="detail-category">
                            {category}
                        </p>

                        <p className="detail-brand">{product.brand}</p>

                        <h1>{product.name}</h1>

                        <div className="detail-rating">
                            <div
                                className="detail-rating-stars"
                                aria-label={`${product.rating} stars`}
                            >
                                {ratingStars.map((starClass, index) => (
                                    <i className={starClass} aria-hidden="true" key={index}></i>
                                ))}
                            </div>

                            <p>({reviewCountDisplay})</p>
                        </div>

                        <p className="detail-price">${Number(product.price).toFixed(2)}</p>

                        <p className="detail-size">
                            Size: {product.size || "Standard size"}
                        </p>

                        <div className="detail-actions">
                            <div className="quantity-control" aria-label="Quantity selector">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() =>
                                        setQuantity((currentQuantity) =>
                                            Math.max(1, currentQuantity - 1)
                                        )
                                    }
                                >
                                    −
                                </button>

                                <span>{quantity}</span>

                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() =>
                                        setQuantity((currentQuantity) => currentQuantity + 1)
                                    }
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                className="add-cart-button"
                                onClick={handleAddToCart}
                            >
                                Add to cart
                            </button>
                        </div>

                        <p className="detail-stock">
                            {product.stock ?? "Several"} units left available
                        </p>

                        {productCharacteristics.length > 0 && (
                            <div
                                className="detail-badges"
                                aria-label={characteristicsLabel}
                            >
                                {productCharacteristics.map((characteristic) => (
                                    <span key={characteristic}>
                                        {formatCharacteristic(characteristic)}
                                    </span>
                                ))}
                            </div>
                        )}

                        {product.description && (
                            <p className="detail-description">{product.description}</p>
                        )}
                    </div>
                </section>

                <section className="product-reviews-section">
                    <h2>{reviewsTitle}</h2>

                    <div className="product-reviews-list">
                        {reviews.map((review, index) => (
                            <article
                                className="product-review-card"
                                key={`${review.user}-${review.comment}-${index}`}
                            >
                                <div className="product-review-header">
                                    <h3>{review.user}</h3>

                                    <div
                                        className="product-review-stars"
                                        aria-label={`${review.rating} stars`}
                                    >
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                            <i
                                                className={
                                                    starIndex < review.rating
                                                        ? "fa-solid fa-star"
                                                        : "fa-regular fa-star"
                                                }
                                                aria-hidden="true"
                                                key={starIndex}
                                            ></i>
                                        ))}
                                    </div>
                                </div>

                                <p>{review.comment}</p>
                            </article>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="product-review-toggle"
                        onClick={() => setIsReviewFormOpen((currentValue) => !currentValue)}
                    >
                        {reviewToggleLabel}
                    </button>

                    {isReviewFormOpen && (
                        <form className="product-review-form" onSubmit={handleReviewSubmit}>
                            <div className="review-form-row">
                                <label>
                                    Name
                                    <input
                                        type="text"
                                        placeholder="Write your name"
                                        value={reviewUser}
                                        onChange={(event) => setReviewUser(event.target.value)}
                                    />
                                </label>

                                <div className="review-rating-field">
                                    <span>Rating</span>

                                    <div
                                        className="review-star-selector"
                                        aria-label="Select rating"
                                    >
                                        {Array.from({ length: 5 }).map((_, index) => {
                                            const starValue = index + 1;
                                            const isSelected = starValue <= reviewRating;

                                            return (
                                                <button
                                                    type="button"
                                                    key={starValue}
                                                    className={isSelected ? "is-selected" : ""}
                                                    aria-label={`${starValue} star${starValue > 1 ? "s" : ""
                                                        }`}
                                                    onClick={() => setReviewRating(starValue)}
                                                >
                                                    <i
                                                        className={
                                                            isSelected
                                                                ? "fa-solid fa-star"
                                                                : "fa-regular fa-star"
                                                        }
                                                        aria-hidden="true"
                                                    ></i>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <label>
                                Review
                                <textarea
                                    placeholder={reviewPlaceholder}
                                    value={reviewComment}
                                    onChange={(event) => setReviewComment(event.target.value)}
                                />
                            </label>

                            <button type="submit">{reviewSubmitLabel}</button>
                        </form>
                    )}
                </section>

                {recommendedProducts.length > 0 && (
                    <section className="recommended-section">
                        <h2>Recommended</h2>

                        <div className="recommended-grid">
                            {recommendedProducts.map((item) => (
                                <Link
                                    to={getRecommendedLink(item)}
                                    className="recommended-card"
                                    key={item.id}
                                >
                                    <div className="recommended-image-box">
                                        <img
                                            src={recommendedImageResolver(item)}
                                            alt={item.name}
                                            referrerPolicy={recommendedImageReferrerPolicy}
                                            onError={
                                                getRecommendedImageFallbackSrc
                                                    ? (event) => {
                                                        const fallback = resolveFallback(
                                                            getRecommendedImageFallbackSrc,
                                                            item
                                                        );

                                                        if (fallback) {
                                                            event.currentTarget.src = fallback;
                                                        }
                                                    }
                                                    : undefined
                                            }
                                        />
                                    </div>

                                    <h3>{item.brand}</h3>

                                    <p>{item.name}</p>

                                    <div className="recommended-stars">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <i
                                                className={
                                                    index < Math.round(item.rating)
                                                        ? "fa-solid fa-star"
                                                        : "fa-regular fa-star"
                                                }
                                                aria-hidden="true"
                                                key={index}
                                            ></i>
                                        ))}
                                    </div>

                                    <strong>${Number(item.price).toFixed(2)}</strong>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer onFeedback={showFeedback} />
        </>
    );
}
