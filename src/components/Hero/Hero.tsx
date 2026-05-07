import { useEffect, useState } from "react";
import { brandLogos, homeBanners } from "../../data/homeContent";

function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const updateHeroFoldHeight = () => {
      const header = document.querySelector(".header-lumiere");

      if (!header) {
        return;
      }

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      if (isMobile) {
        document.documentElement.style.removeProperty("--hero-fold-height");
        return;
      }

      const viewportHeight = window.innerHeight;
      const headerHeight = header.getBoundingClientRect().height;
      const availableHeroHeight = Math.max(
        0,
        Math.round(viewportHeight - headerHeight)
      );

      document.documentElement.style.setProperty(
        "--hero-fold-height",
        `${availableHeroHeight}px`
      );
    };

    updateHeroFoldHeight();

    window.addEventListener("resize", updateHeroFoldHeight);

    return () => {
      window.removeEventListener("resize", updateHeroFoldHeight);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % homeBanners.length);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <section className="landing-hero" id="hero">
        <div className="hero-banner">
          {homeBanners.map((slide, index) => (
            <article
              className={`hero-slide ${index === activeIndex ? "is-active" : ""}`}
              key={slide.id}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className={`hero-image ${slide.imageClassName}`}
              />

              <a href="/products" className="hero-btn">
                Shop Now
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-bar" id="brands">
        <div className="brands-container">
          {brandLogos.map((brand) => (
            <a
              href={brand.href}
              className="brand-logo-link"
              target="_blank"
              rel="noopener noreferrer"
              key={brand.id}
            >
              <img
                src={brand.src}
                alt={brand.name}
                className={`brand-logo ${brand.className}`}
              />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

export default Hero;