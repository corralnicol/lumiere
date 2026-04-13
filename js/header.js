function initializeMobileMenu() {
  const headerBar = document.querySelector(".header-bar");
  const menuToggle = document.querySelector(".menu-toggle");

  if (!headerBar || !menuToggle) {
    return;
  }

  const closeMenu = () => {
    headerBar.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = headerBar.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!headerBar.contains(event.target)) {
      closeMenu();
    }
  });
}

window.addEventListener("DOMContentLoaded", () => initializeMobileMenu());
