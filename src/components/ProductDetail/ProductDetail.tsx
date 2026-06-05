import { Link, useNavigate } from "react-router-dom";
import {
    useEffect,
    useState,
    type ImgHTMLAttributes,
    type SubmitEvent,
} from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import "./ProductDetail.css";
import { useCart } from "@/contexts/CartContext";
import type { Product, ProductReview } from "@/types/products";

type FeedbackType = "info" | "success" | "warning";

export type DetailTab = {
    id: string;
    label: string;
    content: string | undefined;
};

type ProductDetailPageProps = {
    product?: Product | null;
    tabs?: DetailTab[];
    storageKeyPrefix?: string;
    initialReviews?: ProductReview[];
    backLinkHref?: string;
    backLinkLabel?: string;
    notFoundTitle?: string;
    notFoundMessage?: string;
    notFoundLinkText?: string;
    notFoundLinkHref?: string;
    galleryVariant?: "default" | "cover";
    imageSrc?: string;
    imageFallbackSrc?: (product: Product) => string;
    imageReferrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
    characteristicsLabel?: string;
    reviewsTitle?: string;
    reviewToggleLabel?: string;
    reviewSubmitLabel?: string;
    reviewPlaceholder?: string;
    recommendedProducts?: Product[];
    getRecommendedLink?: (item: Product) => string;
    getRecommendedImageSrc?: (item: Product) => string;
    getRecommendedImageFallbackSrc?: (item: Product) => string;
    recommendedImageReferrerPolicy?: ImgHTMLAttributes<HTMLImageElement>["referrerPolicy"];
};

const DEFAULT_REVIEW_PLACEHOLDER = "Write your opinion about this product";

function formatCharacteristic(characteristic: string) {
    return characteristic
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProductDetailPage({
    product,
    storageKeyPrefix = "lumiere-product-reviews-v2",
    initialReviews,
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
}: ProductDetailPageProps) {
    const [quantity, setQuantity] = useState(1);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");
    const [reviews, setReviews] = useState<ProductReview[]>(() => {
        const base = initialReviews ?? product?.reviews ?? [];
        if (!product?.id) return base;
        const key = `${storageKeyPrefix}-${product.id}`;
        const saved = localStorage.getItem(key);
        if (!saved) return base;
        try {
            const parsed = JSON.parse(saved) as ProductReview[];
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch { /* ignore */ }
        return base;
    });
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
    const [reviewUser, setReviewUser] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart({
            id: product!.id,
            category: product!.category ?? "",
            brand: product!.brand,
            name: product!.name,
            description: product!.description,
            imageUrl: product!.imageUrl ?? "",
            rating: product!.rating,
            price: product!.price,
            size: product!.size ?? "",
            stock: product!.stock,
        });
        showFeedback(`${quantity} ${product!.name} added to cart.`, "success");
    };

    const productId = product?.id;

    useEffect(() => {
        if (productId == null) {
            return;
        }

        setQuantity(1);
        setIsReviewFormOpen(false);
        setReviewUser("");
        setReviewRating(5);
        setReviewComment("");
    }, [productId]);

    useEffect(() => {
        if (productId == null || !product) {
            return;
        }

        const resolvedBaseReviews = initialReviews ?? product.reviews;

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
            reviewer_id: crypto.randomUUID(),
            reviewer_name: trimmedUser,
            rating: reviewRating,
            text: trimmedComment,
            created_at: new Date().toISOString(),
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

    const resolvedImageSrc = imageSrc ?? product.imageUrl ?? "";

    const galleryClassName =
        galleryVariant === "cover"
            ? "product-detail-gallery product-detail-gallery--cover"
            : "product-detail-gallery";

    const recommendedImageResolver =
        getRecommendedImageSrc ?? ((item: Product) => item.imageUrl ?? "");

    const category = product.category ?? "Kit";

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
                            className="detail-favorite"
                            type="button"
                            aria-label={`Save ${product.name} to wishlist`}
                            onClick={() =>
                                showFeedback(`${product.name} saved to wishlist.`, "success")
                            }
                        >
                            <i className="fa-regular fa-heart" aria-hidden="true"></i>
                        </button>

                        <img
                            src={resolvedImageSrc}
                            alt={product.name}
                            referrerPolicy={imageReferrerPolicy}
                            onError={
                                imageFallbackSrc
                                    ? (event) => {
                                        const fallback = imageFallbackSrc(product);
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

                            <p>({product.reviews.length})</p>
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
                            {product.stock} units left available
                        </p>

                        {product.characteristics.length > 0 && (
                            <div
                                className="detail-badges"
                                aria-label={characteristicsLabel}
                            >
                                {product.characteristics.map((characteristic) => (
                                    <span key={characteristic}>
                                        {formatCharacteristic(characteristic)}
                                    </span>
                                ))}
                            </div>
                        )}

                        <p className="detail-description">{product.description}</p>
                    </div>
                </section>

                <section className="product-reviews-section">
                    <h2>{reviewsTitle}</h2>

                    <div className="product-reviews-list">
                        {reviews.map((review, index) => (
                            <article
                                className="product-review-card"
                                key={`${review.reviewer_id}-${index}`}
                            >
                                <div className="product-review-header">
                                    <h3>{review.reviewer_name ?? "Anonymous"}</h3>

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

                                <p>{review.text}</p>
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
                                                        const fallback = getRecommendedImageFallbackSrc(item);
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
