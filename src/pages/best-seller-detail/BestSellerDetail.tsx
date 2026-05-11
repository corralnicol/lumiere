import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { bestSellerProducts } from "../../data/bestSellerProducts";
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

  const product = bestSellerProducts.find((item) => item.id === productId);

  const showFeedback = (message: string, type: FeedbackType = "info") => {
    setFeedbackMessage(message);
    setFeedbackType(type);

    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2600);
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

              <p>({product.reviewCount})</p>
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
            {product.reviews.map((review, index) => (
              <article className="product-review-card" key={index}>
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