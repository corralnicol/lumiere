function updateHeroFoldHeight() {
  const header = document.querySelector(".header-lumiere");

  if (!header) {
    return;
  }

  const viewportHeight = window.innerHeight;
  const headerHeight = header.getBoundingClientRect().height;
  const availableHeroHeight = Math.max(0, Math.round(viewportHeight - headerHeight));
  const hero = document.querySelector(".hero-banner");
  hero.setAttribute("style", `height: ${availableHeroHeight}px;`);

  // document.documentElement.style.setProperty("--hero-fold-height", `${availableHeroHeight}px`);
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
}

window.addEventListener("DOMContentLoaded", () => initializeHeroFoldHeight());
