const mobileBreakpointQuery = window.matchMedia("(max-width: 768px)");
const heroSlideInterval = 5000;
const heroSlides = [
  {
    src: "img/banner/loreal.png",
    alt: "L'Oreal Panorama Mascara",
    imageClassName: "hero-image-loreal"
  },
  {
    src: "img/banner/SanValentin.png",
    alt: "San Valentin beauty collection",
    imageClassName: "hero-image-sanvalentin"
  },
  {
    src: "img/banner/Clinique.avif",
    alt: "Clinique beauty campaign",
    imageClassName: "hero-image-clinique"
  }
];

function updateHeroFoldHeight() {
  const header = document.querySelector(".header-lumiere");

  if (!header) {
    return;
  }

  if (mobileBreakpointQuery.matches) {
    document.documentElement.style.removeProperty("--hero-fold-height");
    return;
  }

  const viewportHeight = window.innerHeight;
  const headerHeight = header.getBoundingClientRect().height;
  const availableHeroHeight = Math.max(0, Math.round(viewportHeight - headerHeight));

  document.documentElement.style.setProperty("--hero-fold-height", `${availableHeroHeight}px`);
}

function initializeHeroFoldHeight() {
  const header = document.querySelector(".header-lumiere");

  if (!header) {
    return;
  }

  updateHeroFoldHeight();
  window.addEventListener("resize", updateHeroFoldHeight);

  if ("ResizeObserver" in window) {
    const headerObserver = new ResizeObserver(updateHeroFoldHeight);
    headerObserver.observe(header);
  }

  if ("addEventListener" in mobileBreakpointQuery) {
    mobileBreakpointQuery.addEventListener("change", updateHeroFoldHeight);
  } else {
    mobileBreakpointQuery.addListener(updateHeroFoldHeight);
  }
}

function renderHeroSlides() {
  const heroBanner = document.querySelector(".hero-banner");

  if (!heroBanner) {
    return [];
  }

  heroBanner.innerHTML = heroSlides
    .map((slide, index) => `
      <article class="hero-slide${index === 0 ? " is-active" : ""}">
        <img src="${slide.src}" alt="${slide.alt}" class="hero-image ${slide.imageClassName}">
        <a href="productos.html" class="hero-btn">Shop Now</a>
      </article>
    `)
    .join("");

  return [...heroBanner.querySelectorAll(".hero-slide")];
}

function initializeHeroCarousel() {
  const slides = renderHeroSlides();

  if (slides.length <= 1) {
    return;
  }

  let activeIndex = 0;

  const showSlide = (index) => {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
  };

  window.setInterval(() => {
    activeIndex = (activeIndex + 1) % slides.length;
    showSlide(activeIndex);
  }, heroSlideInterval);
}

window.addEventListener("DOMContentLoaded", () => {
  initializeHeroFoldHeight();
  initializeHeroCarousel();
});
