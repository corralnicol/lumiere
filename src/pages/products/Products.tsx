import { useEffect, useMemo, useState, useTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import productsData from "@/data/products.json";
import { homeCategories } from "@/data/homeContent";
import "./Products.css";
import {
  type Product,
  type ProductCharacteristics,
  hasRequiredFields,
} from "@/types/products";
import { productCharacteristics } from "@/data/characteristics";
import {
  getProductImageSrc,
  handleProductImageError,
} from "@/utils/productImages";

export interface FeedbackState {
  message: string;
  type: "info" | "success" | "warning" | "";
  isVisible: boolean;
}

export type Filters = {
  category: string;
  brands: string[];
  characteristics: ProductCharacteristics[];
  priceMinInput: string;
  priceMaxInput: string;
  ratingMin: number;
};

const rawProducts = productsData as Product[];

const products = rawProducts.filter(hasRequiredFields);

const getUniqueValues = (
  items: Product[],
  getter: (item: Product) => string
) => {
  return Array.from(new Set(items.map(getter))).sort((a, b) =>
    a.localeCompare(b)
  );
};

const toggleValue = <T extends string>(values: T[], value: T) => {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
};

const clampValue = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const categoryOptions = getUniqueValues(products, (product) => product.category);
const brandOptions = getUniqueValues(products, (product) => product.brand);

const characteristicOptions = productCharacteristics.filter((characteristic) =>
  products.some((product) => product.characteristics.includes(characteristic))
);

const categoryOptionsLookup = new Map(
  categoryOptions.map((category) => [category.toLowerCase(), category])
);

const categoryIdLookup = new Map(
  homeCategories.map((category) => [
    category.id.toLowerCase(),
    category.categoryValue,
  ])
);

const buildDefaultFilters = (): Filters => ({
  category: "",
  brands: [],
  characteristics: [],
  priceMinInput: "",
  priceMaxInput: "",
  ratingMin: 0,
});

const parsePriceInput = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const resolveCategoryFromQueryParam = (value: string | null) => {
  const normalizedValue = value?.trim().toLowerCase() ?? "";

  if (normalizedValue === "") {
    return "";
  }

  const mappedCategory =
    categoryIdLookup.get(normalizedValue) ?? normalizedValue;

  return categoryOptionsLookup.get(mappedCategory.toLowerCase()) ?? "";
};

interface FiltersSidebarProps {
  filters: Filters;
  isSidebarOpen: boolean;
  isPending: boolean;
  categoryOptions: string[];
  brandOptions: string[];
  characteristicOptions: ProductCharacteristics[];
  filteredProductsCount: number;
  totalProductsCount: number;
  activeFilterCount: number;
  onToggleSidebar: () => void;
  onCategoryChange: (category: string) => void;
  onBrandToggle: (brand: string) => void;
  onCharacteristicToggle: (characteristic: ProductCharacteristics) => void;
  onPriceMinChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onClearFilters: () => void;
}

function ActivityIndicator({ isVisible }: { isVisible: boolean }) {
  return (
    <div
      className={`activity-indicator ${isVisible ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {isVisible ? (
        <>
          <span className="activity-spinner" aria-hidden="true"></span>
          <span>Updating results...</span>
        </>
      ) : null}
    </div>
  );
}

function FiltersSidebar({
  filters,
  isSidebarOpen,
  isPending,
  categoryOptions,
  brandOptions,
  characteristicOptions,
  filteredProductsCount,
  totalProductsCount,
  activeFilterCount,
  onToggleSidebar,
  onCategoryChange,
  onBrandToggle,
  onCharacteristicToggle,
  onPriceMinChange,
  onPriceMaxChange,
  onRatingChange,
  onClearFilters,
}: FiltersSidebarProps) {
  const priceMinValue = parsePriceInput(filters.priceMinInput);
  const priceMaxValue = parsePriceInput(filters.priceMaxInput);

  const priceHint =
    priceMinValue === null && priceMaxValue === null
      ? "Any price"
      : `${priceMinValue !== null ? formatPrice(priceMinValue) : "Any"} - ${
          priceMaxValue !== null ? formatPrice(priceMaxValue) : "Any"
        }`;

  return (
    <aside
      className={`filters-sidebar ${
        isSidebarOpen ? "is-open" : "is-collapsed"
      }`}
      aria-label="Product filters"
    >
      <div className="filters-header">
        <div>
          <p className="filters-eyebrow">Refine</p>
          <h2>Filters</h2>
          <div className="filters-meta">
            <span>
              {filteredProductsCount} of {totalProductsCount} items
            </span>
            {activeFilterCount > 0 ? (
              <span className="filters-active">{activeFilterCount} active</span>
            ) : null}
          </div>
        </div>

        <button
          className="filters-toggle"
          type="button"
          aria-expanded={isSidebarOpen}
          aria-controls="filters-panel"
          onClick={onToggleSidebar}
        >
          <i
            className={`fa-solid ${
              isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
            }`}
            aria-hidden="true"
          ></i>
          <span>{isSidebarOpen ? "Collapse" : "Expand"}</span>
        </button>
      </div>

      <ActivityIndicator isVisible={isPending} />

      <div className="filters-panel" id="filters-panel" hidden={!isSidebarOpen}>
        <fieldset className="filters-group">
          <legend>Category</legend>

          <div className="filters-select">
            <select
              value={filters.category}
              onChange={(event) => onCategoryChange(event.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset className="filters-group">
          <legend>Brand</legend>

          <div className="filters-options">
            {brandOptions.map((brand, index) => {
              const inputId = `filter-brand-${index}`;

              return (
                <label className="filters-option" htmlFor={inputId} key={brand}>
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => onBrandToggle(brand)}
                  />
                  <span>{brand}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filters-group">
          <legend>Price</legend>

          <div className="filters-range">
            <label>
              <span>Min</span>
              <input
                type="number"
                step={0.01}
                placeholder="Any"
                value={filters.priceMinInput}
                onChange={(event) => onPriceMinChange(event.target.value)}
              />
            </label>

            <label>
              <span>Max</span>
              <input
                type="number"
                step={0.01}
                placeholder="Any"
                value={filters.priceMaxInput}
                onChange={(event) => onPriceMaxChange(event.target.value)}
              />
            </label>
          </div>

          <p className="filters-range-hint">{priceHint}</p>
        </fieldset>

        <fieldset className="filters-group">
          <legend>Characteristics</legend>

          <div className="filters-options">
            {characteristicOptions.map((characteristic, index) => {
              const inputId = `filter-characteristic-${index}`;

              return (
                <label
                  className="filters-option"
                  htmlFor={inputId}
                  key={characteristic}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={filters.characteristics.includes(characteristic)}
                    onChange={() => onCharacteristicToggle(characteristic)}
                  />
                  <span>{characteristic.replace(/-/g, " ")}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="filters-group">
          <legend>Rating</legend>

          <div className="filters-rating">
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={filters.ratingMin}
              aria-label="Minimum rating"
              onChange={(event) => onRatingChange(Number(event.target.value))}
            />
            <span>{filters.ratingMin.toFixed(1)}+ stars</span>
          </div>
        </fieldset>

        <div className="filters-actions">
          <button type="button" onClick={onClearFilters}>
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}

function ProductStars({ rating }: { rating: number }) {
  const roundedRating = Math.round(rating);

  return (
    <div className="product-card-rating" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} aria-hidden="true">
          {index < roundedRating ? "★" : "☆"}
        </span>
      ))}
      <span className="product-card-rating-number">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductListCard({ product, index }: { product: Product; index: number }) {
  // Aquí se resuelve la imagen real del producto.
  // Si la imagen viene rota, el onError usa una imagen estable por categoría.
  const productImageSrc = getProductImageSrc(product);

  return (
    <article
      className="product-card"
      style={{ animationDelay: `${Math.min(index * 40, 360)}ms` }}
    >
      <Link
        className="product-card-link"
        to={`/product-details/${product.id}`}
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-card-image-wrap">
          <span className="product-card-category">{product.category}</span>

          <img
            className="product-card-image"
            src={productImageSrc}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => handleProductImageError(event, product)}
          />
        </div>

        <div className="product-card-content">
          <h3>{product.brand}</h3>
          <p className="product-card-name">{product.name}</p>

          <ProductStars rating={product.rating} />

          <p className="product-card-price">{formatPrice(product.price)}</p>

          <div className="product-card-meta">
            {"size" in product && product.size ? (
              <span>{product.size}</span>
            ) : null}

            {"stock" in product && typeof product.stock !== "undefined" ? (
              <span>{product.stock} left</span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export function Products() {
  const [searchParams] = useSearchParams();

  const resolvedCategoryFromQuery = resolveCategoryFromQueryParam(
    searchParams.get("category")
  );

  const [feedback, setFeedback] = useState<FeedbackState>({
    message: "",
    type: "",
    isVisible: false,
  });

  const [filters, setFilters] = useState<Filters>(() => ({
    ...buildDefaultFilters(),
    category: resolvedCategoryFromQuery,
  }));

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return !window.matchMedia("(max-width: 900px)").matches;
  });

  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    setFilters((current) => {
      if (current.category === resolvedCategoryFromQuery) {
        return current;
      }

      return {
        ...current,
        category: resolvedCategoryFromQuery,
      };
    });
  }, [resolvedCategoryFromQuery]);

  const updateFilters = (updater: (current: Filters) => Filters) => {
    startTransition(() => {
      setFilters((current) => updater(current));
    });
  };

  const handleCategoryChange = (category: string) => {
    updateFilters((current) => ({
      ...current,
      category,
    }));
  };

  const handleBrandToggle = (brand: string) => {
    updateFilters((current) => ({
      ...current,
      brands: toggleValue(current.brands, brand),
    }));
  };

  const handleCharacteristicToggle = (
    characteristic: ProductCharacteristics
  ) => {
    updateFilters((current) => ({
      ...current,
      characteristics: toggleValue(current.characteristics, characteristic),
    }));
  };

  const handlePriceMinChange = (value: string) => {
    updateFilters((current) => {
      const minValue = parsePriceInput(value);
      const maxValue = parsePriceInput(current.priceMaxInput);

      const nextMaxInput =
        minValue !== null && maxValue !== null && minValue > maxValue
          ? value
          : current.priceMaxInput;

      return {
        ...current,
        priceMinInput: value,
        priceMaxInput: nextMaxInput,
      };
    });
  };

  const handlePriceMaxChange = (value: string) => {
    updateFilters((current) => {
      const minValue = parsePriceInput(current.priceMinInput);
      const maxValue = parsePriceInput(value);

      const nextMinInput =
        minValue !== null && maxValue !== null && maxValue < minValue
          ? value
          : current.priceMinInput;

      return {
        ...current,
        priceMinInput: nextMinInput,
        priceMaxInput: value,
      };
    });
  };

  const handleRatingChange = (value: number) => {
    updateFilters((current) => ({
      ...current,
      ratingMin: clampValue(value, 0, 5),
    }));
  };

  const handleClearFilters = () => {
    startTransition(() => {
      setFilters(buildDefaultFilters());
    });

    showFeedback("Filters cleared. Showing all products.", "info");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const minPrice = parsePriceInput(filters.priceMinInput);
      const maxPrice = parsePriceInput(filters.priceMaxInput);

      if (filters.category !== "" && product.category !== filters.category) {
        return false;
      }

      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      if (filters.characteristics.length > 0) {
        const matchesAll = filters.characteristics.every((characteristic) =>
          product.characteristics.includes(characteristic)
        );

        if (!matchesAll) {
          return false;
        }
      }

      if (minPrice !== null && product.price < minPrice) {
        return false;
      }

      if (maxPrice !== null && product.price > maxPrice) {
        return false;
      }

      if (product.rating < filters.ratingMin) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.category !== "") {
      count += 1;
    }

    if (filters.brands.length > 0) {
      count += 1;
    }

    if (filters.characteristics.length > 0) {
      count += 1;
    }

    if (
      filters.priceMinInput.trim() !== "" ||
      filters.priceMaxInput.trim() !== ""
    ) {
      count += 1;
    }

    if (filters.ratingMin > 0) {
      count += 1;
    }

    return count;
  }, [filters]);

  return (
    <>
      <a className="skip-link" href="#products-main">
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

      <main id="products-main" className="products-page" tabIndex={-1}>
        <div className="products-layout">
          <FiltersSidebar
            filters={filters}
            isSidebarOpen={isSidebarOpen}
            isPending={isPending}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
            characteristicOptions={characteristicOptions}
            filteredProductsCount={filteredProducts.length}
            totalProductsCount={products.length}
            activeFilterCount={activeFilterCount}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
            onCategoryChange={handleCategoryChange}
            onBrandToggle={handleBrandToggle}
            onCharacteristicToggle={handleCharacteristicToggle}
            onPriceMinChange={handlePriceMinChange}
            onPriceMaxChange={handlePriceMaxChange}
            onRatingChange={handleRatingChange}
            onClearFilters={handleClearFilters}
          />

          <section className="products-grid-section" aria-label="Product list">
            <div className="products-grid-header">
              <div>
                <p className="products-grid-eyebrow">Shop the full edit</p>
                <h2>All products</h2>
              </div>

              <div className="products-grid-count">
                <span>{filteredProducts.length} items</span>

                {activeFilterCount > 0 ? (
                  <span className="products-grid-active">
                    {activeFilterCount} active filter
                    {activeFilterCount > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="products-empty">
                <h3>No matches found</h3>
                <p>Try clearing a filter or widening the price and rating range.</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, index) => (
                  <ProductListCard
                    product={product}
                    index={index}
                    key={product.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer onFeedback={showFeedback} />
    </>
  );
}

export default Products;
