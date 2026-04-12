const mobileBreakpointQuery = window.matchMedia("(max-width: 768px)");

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

window.addEventListener("DOMContentLoaded", () => initializeHeroFoldHeight());
