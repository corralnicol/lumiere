import { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Categories from "../../components/Categories/Categories";
import BestSellers from "../../components/BestSellers/BestSellers";
import Footer from "../../components/Footer/Footer";
import { homeKits } from "../../data/homeContent";

type FeedbackState = {
  message: string;
  type: "info" | "success" | "warning" | "";
  isVisible: boolean;
};

function Home() {
  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    type: "",
    isVisible: false,
  });

  const showFeedback = (
    message: string,
    type: "info" | "success" | "warning" = "info"
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

          <div className="kits-grid">
            {homeKits.map((kit) => (
              <article
                className={`kits-card ${kit.cardClassName}`}
                key={kit.id}
              >
                <img
                  src={kit.src}
                  alt={kit.alt}
                  className={kit.imageClassName}
                />
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
}

export default Home;