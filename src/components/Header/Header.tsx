import { useState, type FormEvent } from "react";


type HeaderProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function Header({ onFeedback }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const rawQuery = searchValue.trim();
    const query = rawQuery.toLowerCase();

    const searchables = Array.from(
      document.querySelectorAll<HTMLElement>("[data-search-target]")
    );

    searchables.forEach((element) => {
      element.classList.remove("is-search-match");
    });

    if (!query) {
      onFeedback("Search cleared. Try terms like blush, Clinique or lip.", "info");
      return;
    }

    const matches = searchables.filter((element) => {
      const searchableText = element.dataset.searchTarget || "";
      return searchableText.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
      onFeedback(`No matching items found for "${rawQuery}".`, "warning");
      return;
    }

    matches.forEach((element) => {
      element.classList.add("is-search-match");
    });

    matches[0].scrollIntoView({ behavior: "smooth", block: "center" });

    onFeedback(
      `Showing ${matches.length} search result${matches.length > 1 ? "s" : ""}.`,
      "success"
    );
  };

  const handleClearSearch = () => {
    setSearchValue("");

    const searchables = Array.from(
      document.querySelectorAll<HTMLElement>("[data-search-target]")
    );

    searchables.forEach((element) => {
      element.classList.remove("is-search-match");
    });

    onFeedback("Search reset. You can try a different keyword now.", "info");
  };

  const handleUtilityClick = (
    type: "favorites" | "cart" | "account"
  ) => {
    if (type === "favorites") {
      onFeedback("Favorites are still in development and will be available soon.", "info");
    }

    if (type === "cart") {
      onFeedback("Opening the products page so you can continue shopping.", "info");
    }

    if (type === "account") {
      onFeedback("The account section is still in development and will be available soon.", "info");
    }

    closeMenu();
  };

  return (
    <header className="header-lumiere" id="top">
      <div className="degrade">
        <a href="#top" className="logo-link" aria-label="Go to top">
          <h1 className="logo">Lumière</h1>
        </a>
      </div>

      <div className={`header-bar ${isMenuOpen ? "menu-open" : ""}`}>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <i className="fa-solid fa-bars" aria-hidden="true"></i>
        </button>

        <nav
          className="main-nav"
          id="primary-navigation"
          aria-label="Primary navigation"
        >
          <a href="/products" onClick={closeMenu}>
            Shop <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </a>
          <a href="#best-sellers" onClick={closeMenu}>On Sale</a>
          <a href="#brands" onClick={closeMenu}>Brands</a>
          <a href="#categories" onClick={closeMenu}>Categories</a>
          <a href="#best-sellers" onClick={closeMenu}>Best Sellers</a>
          <a href="/seller" onClick={closeMenu}>Seller</a>

          <div className="mobile-menu-icons">
            <a
              href="#best-sellers"
              aria-label="Favorites"
              onClick={() => handleUtilityClick("favorites")}
            >
              <i className="fa-regular fa-heart" aria-hidden="true"></i>
            </a>

            <a
              href="/products"
              aria-label="Cart"
              onClick={() => handleUtilityClick("cart")}
            >
              <i className="fa-solid fa-shopping-cart" aria-hidden="true"></i>
            </a>

            <a
              href="#newsletter"
              aria-label="Account"
              onClick={() => handleUtilityClick("account")}
            >
              <i className="fa-regular fa-user" aria-hidden="true"></i>
            </a>
          </div>
        </nav>

        <form
          className="search-box"
          role="search"
          aria-label="Site search"
          onSubmit={handleSearchSubmit}
        >
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>

          <input
            type="text"
            placeholder="Search for products..."
            aria-label="Search for products"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />

          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={handleClearSearch}
          >
            Clear
          </button>
        </form>

        <div className="header-icons">
          <a
            href="#best-sellers"
            aria-label="Favorites"
            onClick={() => handleUtilityClick("favorites")}
          >
            <i className="fa-regular fa-heart" aria-hidden="true"></i>
          </a>

          <a
            href="/products"
            aria-label="Cart"
            onClick={() => handleUtilityClick("cart")}
          >
            <i className="fa-solid fa-shopping-cart" aria-hidden="true"></i>
          </a>

          <a
            href="#newsletter"
            aria-label="Account"
            onClick={() => handleUtilityClick("account")}
          >
            <i className="fa-regular fa-user" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;