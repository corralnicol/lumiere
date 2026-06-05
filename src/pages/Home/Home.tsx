import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Categories/Categories";
import BestSellers from "../../components/BestSellers/BestSellers";
import Footer from "../../components/Footer/Footer";
import { getProductImageSrc } from "@/utils/productImages";
import { useKits } from "@/hooks/useProducts";

type FeedbackType = "info" | "success" | "warning";

type FeedbackState = {
  message: string;
  type: FeedbackType | "";
  isVisible: boolean;
};

function Home() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    type: "",
    isVisible: false,
  });

  const { data: kits, loading: kitsLoading, error: kitsError } = useKits();

  const showFeedback = (
    message: string,
    type: FeedbackType = "info"
  ) => {
    setFeedback({
      message,
      type,
      isVisible: true,
    });
  };

  useEffect(() => {
    if (!feedback.isVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback((currentFeedback) => ({
        ...currentFeedback,
        isVisible: false,
        type: "",
      }));
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback.isVisible, feedback.message]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Header onFeedback={showFeedback} />

      <div
        className={`interaction-feedback ${
          feedback.isVisible ? "is-visible" : ""
        }`}
        data-state={feedback.type}
        aria-live="polite"
        role="status"
      >
        {feedback.message}
      </div>

      <main id="main-content" tabIndex={-1}>
        <Hero />

        <Categories />

        <BestSellers onFeedback={showFeedback} />

        <section className="kits-section" id="kits">
          <h2 className="kits-title">Kits &amp; Sets</h2>

          {kitsError ? (
            <p className="products-error">Could not load kits.</p>
          ) : kitsLoading ? (
            <div className="kits-grid kits-grid--loading" role="status" aria-live="polite">
              <span className="activity-spinner" aria-hidden="true"></span>
            </div>
          ) : (
            <div className="kits-grid">
              {kits.map((kit) => (
                <Link
                  to={`/products/${kit.id}`}
                  className="kits-card"
                  key={kit.id}
                  aria-label={`View details for ${kit.name}`}
                >
                  <img src={getProductImageSrc(kit)} alt={kit.name} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
}

export default Home;
