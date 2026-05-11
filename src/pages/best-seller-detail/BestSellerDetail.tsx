import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import {
  bestSellerProducts,
  type ProductReview,
} from "../../data/bestSellerProducts";
import productsData from "../../data/products.json";
import { getProductImageSrc } from "../../utils/productImages";
import "./BestSellerDetail.css";

type FeedbackType = "info" | "success" | "warning";

type DetailTab = "description" | "howToUse" | "ingredients";

type JsonProduct = {
  id: number | string;
  category: string;
  brand: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: number;
  size?: string;
  stock?: number;
  reviews?: {
    user: string;
    rating: number;
    comment: string;
  }[];
};

const jsonProducts = productsData as JsonProduct[];

function formatCharacteristic(characteristic: string) {
  return characteristic
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function BestSellerDetail() {
  const { productId } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewUser, setReviewUser] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const product = bestSellerProducts.find((item) => item.id === productId);

  useEffect(() => {
    if (!product) {
      return;
    }

    const storageKey = `lumiere-reviews-${product.id}`;
    const savedReviews = localStorage.getItem(storageKey);

    if (!savedReviews) {
      setReviews(product.reviews);
      return;
    }

    try {
      const parsedReviews = JSON.parse(savedReviews) as ProductReview[];

      if (Array.isArray(parsedReviews)) {
        setReviews(parsedReviews);
      } else {
        setReviews(product.reviews);
      }
    } catch {
      setReviews(product.reviews);
    }
  }, [product]);

  const showFeedback = (message: string, type: FeedbackType = "info") => {
    setFeedbackMessage(message);
    setFeedbackType(type);

    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2600);
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
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
      `lumiere-reviews-${product.id}`,
      JSON.stringify(updatedReviews)
    );

    setReviewUser("");
    setReviewRating(5);
    setReviewComment("");
    setIsReviewFormOpen(false);

    showFeedback("Your review was submitted successfully.", "success");
  };

  if (!product) {
    return (
      <>
        <Header onFeedback={showFeedback} />

        <main className="product-detail-empty">
          <h1>Product not found</h1>
          <p>The product you are looking for does not exist.</p>
          <Link to="/">Back to home</Link>
        </main>

        <Footer onFeedback={showFeedback} />
      </>
    );
  }

  const recommendedProducts = jsonProducts.slice(0, 4);

  const extraReviewCount = Math.max(0, reviews.length - product.reviews.length);
  const visibleReviewCount = product.reviewCount + extraReviewCount;

  const ratingStars = Array.from({ length: 5 }).map((_, index) =>
    index < Math.round(product.rating)
      ? "fa-solid fa-star"
      : "fa-regular fa-star"
  );

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
        <Link to="/" className="detail-back-link">
          ← Back to home
        </Link>

        <section className="product-detail-hero">
          <div className="product-detail-gallery">
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

            <img src={product.image} alt={product.name} />
          </div>

          <div className="product-detail-info">
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

              <p>({visibleReviewCount})</p>
            </div>

            <p className="detail-price">${Number(product.price).toFixed(2)}</p>

            <p className="detail-size">Size: {product.size}</p>

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
                onClick={() =>
                  showFeedback(
                    `${quantity} ${product.name} added to cart.`,
                    "success"
                  )
                }
              >
                Add to cart
              </button>
            </div>

            <p className="detail-stock">{product.stock} units left available</p>

            <div className="detail-badges" aria-label="Product characteristics">
              {product.characteristics.map((characteristic) => (
                <span key={characteristic}>
                  {formatCharacteristic(characteristic)}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="product-detail-description">
          <div className="detail-tabs">
            <button
              type="button"
              className={activeTab === "description" ? "is-active" : ""}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>

            <button
              type="button"
              className={activeTab === "howToUse" ? "is-active" : ""}
              onClick={() => setActiveTab("howToUse")}
            >
              How to use
            </button>

            <button
              type="button"
              className={activeTab === "ingredients" ? "is-active" : ""}
              onClick={() => setActiveTab("ingredients")}
            >
              Ingredients
            </button>
          </div>

          <p>{product.details[activeTab]}</p>
        </section>

        <section className="product-reviews-section">
          <h2>Reviews</h2>

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
            add yours
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

                  <div className="review-star-selector" aria-label="Select rating">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const isSelected = starValue <= reviewRating;

                      return (
                        <button
                          type="button"
                          key={starValue}
                          className={isSelected ? "is-selected" : ""}
                          aria-label={`${starValue} star${
                            starValue > 1 ? "s" : ""
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
                  placeholder="Write your opinion about this product"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                />
              </label>

              <button type="submit">Submit review</button>
            </form>
          )}
        </section>

        <section className="recommended-section">
          <h2>Recommended</h2>

          <div className="recommended-grid">
            {recommendedProducts.map((item) => (
              <Link
                to={`/products/${item.id}`}
                className="recommended-card"
                key={item.id}
              >
                <div className="recommended-image-box">
                  <img
                    src={getProductImageSrc(item)}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.src = `https://picsum.photos/300/300?random=${item.id}`;
                    }}
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
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
}

export default BestSellerDetail;