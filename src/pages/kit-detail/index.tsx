import { Link, useParams } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { kitProducts, type KitReview } from "../../data/kitProducts";
import "../best-seller-detail/BestSellerDetail.css";

type FeedbackType = "info" | "success" | "warning";
type DetailTab = "description" | "howToUse" | "ingredients";

function formatCharacteristic(characteristic: string) {
  return characteristic
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function KitDetail() {
  const { kitId } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("description");

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");

  const [reviews, setReviews] = useState<KitReview[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewUser, setReviewUser] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const kit = kitProducts.find((item) => item.id === kitId);

  useEffect(() => {
    if (!kit) {
      return;
    }

    const storageKey = `lumiere-kit-reviews-${kit.id}`;
    const savedReviews = localStorage.getItem(storageKey);

    if (!savedReviews) {
      setReviews(kit.reviews);
      return;
    }

    try {
      const parsedReviews = JSON.parse(savedReviews) as KitReview[];

      if (Array.isArray(parsedReviews) && parsedReviews.length > 0) {
        setReviews(parsedReviews);
      } else {
        setReviews(kit.reviews);
      }
    } catch {
      setReviews(kit.reviews);
    }
  }, [kit]);

  const showFeedback = (message: string, type: FeedbackType = "info") => {
    setFeedbackMessage(message);
    setFeedbackType(type);

    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2600);
  };

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!kit) {
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

    const newReview: KitReview = {
      user: trimmedUser,
      rating: reviewRating,
      comment: trimmedComment,
    };

    const updatedReviews = [newReview, ...reviews];

    setReviews(updatedReviews);
    localStorage.setItem(
      `lumiere-kit-reviews-${kit.id}`,
      JSON.stringify(updatedReviews)
    );

    setReviewUser("");
    setReviewRating(5);
    setReviewComment("");
    setIsReviewFormOpen(false);

    showFeedback("Your review was submitted successfully.", "success");
  };

  if (!kit) {
    return (
      <>
        <Header onFeedback={showFeedback} />

        <main className="product-detail-empty">
          <h1>Kit not found</h1>
          <p>The kit you are looking for does not exist.</p>
          <Link to="/">Back to home</Link>
        </main>

        <Footer onFeedback={showFeedback} />
      </>
    );
  }

  const recommendedKits = kitProducts
    .filter((item) => item.id !== kit.id)
    .slice(0, 4);

  const extraReviewCount = Math.max(0, reviews.length - kit.reviews.length);
  const visibleReviewCount = kit.reviewCount + extraReviewCount;

  const ratingStars = Array.from({ length: 5 }).map((_, index) =>
    index < Math.round(kit.rating) ? "fa-solid fa-star" : "fa-regular fa-star"
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
              aria-label={`Save ${kit.name} to wishlist`}
              onClick={() =>
                showFeedback(`${kit.name} saved to wishlist.`, "success")
              }
            >
              <i className="fa-regular fa-heart" aria-hidden="true"></i>
            </button>

            <img src={kit.image} alt={kit.name} />
          </div>

          <div className="product-detail-info">
            <p className="detail-brand">{kit.brand}</p>

            <h1>{kit.name}</h1>

            <div className="detail-rating">
              <div className="detail-rating-stars" aria-label={`${kit.rating} stars`}>
                {ratingStars.map((starClass, index) => (
                  <i className={starClass} aria-hidden="true" key={index}></i>
                ))}
              </div>

              <p>({visibleReviewCount})</p>
            </div>

            <p className="detail-price">${Number(kit.price).toFixed(2)}</p>

            <p className="detail-size">Size: {kit.size}</p>

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
                  showFeedback(`${quantity} ${kit.name} added to cart.`, "success")
                }
              >
                Add to cart
              </button>
            </div>

            <p className="detail-stock">{kit.stock} units left available</p>

            <div className="detail-badges" aria-label="Kit characteristics">
              {kit.characteristics.map((characteristic) => (
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

          <p>{kit.details[activeTab]}</p>
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
                  placeholder="Write your opinion about this kit"
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
            {recommendedKits.map((item) => (
              <Link
                to={`/kits/${item.id}`}
                className="recommended-card"
                key={item.id}
              >
                <div className="recommended-image-box">
                  <img src={item.image} alt={item.name} />
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

export default KitDetail;