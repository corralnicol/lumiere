import { useState, useRef, useEffect, type SubmitEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserState } from "@/contexts/user/useUser";
import { useCart } from "@/contexts/useCart";
import { useFavoritesState } from "@/contexts/favorites/useFavorites";
import { useProductsByIds } from "@/hooks/useProducts";
import { getProductImageSrc } from "@/utils/productImages";

type HeaderProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function AccountIcon({ closeMenu }: { closeMenu: () => void }) {
  const user = useUserState();
  const link = user?.isLoggedIn ? "/account" : "/auth/sign-in";

  const initials = user?.isLoggedIn
    ? (user.name ?? '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('')
    : '';

  return (
    <Link to={link} aria-label="Account" onClick={closeMenu} className="header-account-link">
      {user?.isLoggedIn ? (
        user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="header-avatar-img" />
        ) : (
          <span className="header-avatar-initials" aria-hidden="true">{initials || '?'}</span>
        )
      ) : (
        <i className="fa-regular fa-user" aria-hidden="true"></i>
      )}
    </Link>
  );
}

function FavoritesDropdown({ onClose }: { onClose: () => void }) {
  const user = useUserState();
  const { ids, loading: favLoading } = useFavoritesState();
  const { data: favProducts, loading: prodLoading } = useProductsByIds(ids);
  const isLoading = favLoading || prodLoading;

  if (!user.isLoggedIn) {
    return (
      <div className="fav-dropdown-empty">
        <p>Sign in to view your favorites.</p>
        <Link to="/auth/sign-in" className="fav-dropdown-signin" onClick={onClose}>
          Sign in
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fav-dropdown-empty">
        <span className="activity-spinner" aria-hidden="true"></span>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="fav-dropdown-empty">
        <p>No favorites yet. Tap the heart on any product to save it.</p>
      </div>
    );
  }

  return (
    <ul className="fav-dropdown-list">
      {favProducts.map((p) => (
        <li key={p.id}>
          <Link to={`/products/${p.id}`} className="fav-dropdown-row" onClick={onClose}>
            <img src={getProductImageSrc(p)} alt={p.name} className="fav-row-img" />
            <span className="fav-row-info">
              <span className="fav-row-brand">{p.brand}</span>
              <span className="fav-row-name">{p.name}</span>
            </span>
            <span className="fav-row-price">${Number(p.price).toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Header({ onFeedback }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isFavOpen, setIsFavOpen] = useState(false);
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { ids: favIds } = useFavoritesState();
  const favCount = favIds.length;
  const location = useLocation();
  const desktopFavRef = useRef<HTMLDivElement>(null);
  const mobileFavRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeAll = () => {
    setIsFavOpen(false);
    setIsMenuOpen(false);
  };

  // Cerramos favoritos cuando cambia la ruta.
  useEffect(() => {
    setIsFavOpen(false);
  }, [location.pathname]);

  // Cerramos favoritos si el usuario hace clic afuera.
  useEffect(() => {
    if (!isFavOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        desktopFavRef.current && !desktopFavRef.current.contains(e.target as Node) &&
        mobileFavRef.current && !mobileFavRef.current.contains(e.target as Node)
      ) {
        setIsFavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFavOpen]);

  const handleSearchSubmit = (event: SubmitEvent<HTMLFormElement>) => {
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

  return (
    <header className="header-lumiere" id="top">
      <div className="degrade">
        <Link to="/" className="logo-link" aria-label="Go to home">
          <h1 className="logo">Lumière</h1>
        </Link>
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
          <Link to="/products" onClick={closeMenu}>Shop</Link>
          <Link to="/#brands" onClick={closeMenu}>Brands</Link>
          <Link to="/#categories" onClick={closeMenu}>Categories</Link>
          <Link to="/#best-sellers" onClick={closeMenu}>Best Sellers</Link>
          <Link to="/#kits" onClick={closeMenu}>Kits &amp; Sets</Link>
          <Link to="/seller" onClick={closeMenu}>Seller</Link>

          <div className="mobile-menu-icons">
            <div className="fav-anchor" ref={mobileFavRef}>
              <button
                type="button"
                className="fav-heart-btn"
                aria-label={favCount > 0 ? `Favorites, ${favCount} items` : "Favorites"}
                aria-expanded={isFavOpen}
                aria-haspopup="true"
                onClick={() => setIsFavOpen((v) => !v)}
              >
                <i className="fa-regular fa-heart" aria-hidden="true"></i>
                {favCount > 0 && <span className="cart-badge" aria-hidden="true">{favCount}</span>}
              </button>
              {isFavOpen && (
                <div className="fav-dropdown fav-dropdown--mobile">
                  <FavoritesDropdown onClose={closeAll} />
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="cart-link"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
              onClick={() => closeMenu()}
            >
              <i className="fa-solid fa-shopping-cart" aria-hidden="true"></i>
              {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
            </Link>

            <AccountIcon closeMenu={closeMenu} />
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
          <div className="fav-anchor" ref={desktopFavRef}>
            <button
              type="button"
              className="fav-heart-btn"
              aria-label="Favorites"
              aria-expanded={isFavOpen}
              aria-haspopup="true"
              onClick={() => setIsFavOpen((v) => !v)}
            >
              <i className="fa-regular fa-heart" aria-hidden="true"></i>
            </button>
            {isFavOpen && (
              <div className="fav-dropdown">
                <FavoritesDropdown onClose={closeAll} />
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="cart-link"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            onClick={() => closeMenu()}
          >
            <i className="fa-solid fa-shopping-cart" aria-hidden="true"></i>
            {cartCount > 0 && <span className="cart-badge" aria-hidden="true">{cartCount}</span>}
          </Link>

          <AccountIcon closeMenu={closeMenu} />
        </div>
      </div>
    </header>
  );
}

export default Header;
