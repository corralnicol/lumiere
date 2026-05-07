import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import productsData from "../../data/products.json";
import { getProductImageSrc } from "../../utils/productImages";
import "../best-seller-detail/BestSellerDetail.css";

type Product = {
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
  reviews?: unknown[];
  localImage?: string;
};

type FeedbackType = "info" | "success" | "warning";

const products = productsData as Product[];

function ProductDetail() {
  const { productId } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "details" | "reviews"
  >("description");

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");

  const product = products.find((item) => String(item.id) === productId);

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

  const recommendedProductsByCategory = products
    .filter(
      (item) =>
        String(item.id) !== String(product.id) &&
        item.category === product.category
    )
    .slice(0, 4);

  const fallbackRecommendedProducts = products
    .filter((item) => String(item.id) !== String(product.id))
    .slice(0, 4);

  const finalRecommendedProducts =
    recommendedProductsByCategory.length > 0
      ? recommendedProductsByCategory
      : fallbackRecommendedProducts;

  const ratingStars = Array.from({ length: 5 }).map((_, index) =>
    index < Math.round(product.rating)
      ? "fa-solid fa-star"
      : "fa-regular fa-star"
  );

  const getTabContent = () => {
    if (activeTab === "description") {
      return product.description;
    }

    if (activeTab === "details") {
      return `Category: ${product.category}. Brand: ${product.brand}. Size: ${
        product.size || "Standard size"
      }. Stock: ${product.stock ?? "Available"}.`;
    }

    return product.reviews && product.reviews.length > 0
      ? `${product.reviews.length} review${
          product.reviews.length === 1 ? "" : "s"
        } available.`
      : "No reviews yet.";
  };

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

            <img src={getProductImageSrc(product)} alt={product.name} />
          </div>

          <div className="product-detail-info">
            <h1>{product.brand}</h1>

            <p className="detail-product-name">{product.name}</p>

            <div className="detail-rating">
              <div
                className="detail-rating-stars"
                aria-label={`${product.rating} stars`}
              >
                {ratingStars.map((starClass, index) => (
                  <i className={starClass} aria-hidden="true" key={index}></i>
                ))}
              </div>

              <p>
                ({product.rating}) ({product.reviews?.length ?? 0})
              </p>
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

            <p className="detail-stock">
              {product.stock ?? "Several"} units left available
            </p>

            <div className="detail-badges">
              <span>{product.category}</span>
              <span>{product.brand}</span>
              <span>{product.rating} stars</span>
            </div>

            <button
              className="reviews-button"
              type="button"
              onClick={() =>
                showFeedback(
                  "Ratings and reviews section will be available soon.",
                  "info"
                )
              }
            >
              Ratings &amp; Reviews
            </button>
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
              className={activeTab === "details" ? "is-active" : ""}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>

            <button
              type="button"
              className={activeTab === "reviews" ? "is-active" : ""}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
          </div>

          <p>{getTabContent()}</p>
        </section>

        <section className="recommended-section">
          <h2>Recommended</h2>

          <div className="recommended-grid">
            {finalRecommendedProducts.map((item) => (
              <Link
                to={`/products/${item.id}`}
                className="recommended-card"
                key={item.id}
              >
                <div className="recommended-image-box">
                  <img src={getProductImageSrc(item)} alt={item.name} />
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

export default ProductDetail;