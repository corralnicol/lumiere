import { useEffect, useMemo, useState, useTransition } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import productsData from "@/data/products.json";
import "./Products.css";
import {
    type Product,
    type ProductCharacteristics,
    hasRequiredFields,
    productCharacteristicsArray,
} from "@/types/products";
import { ProductCard } from "@/components/ProductCard";

export interface FeedbackState {
    message: string;
    type: "info" | "success" | "warning" | "";
    isVisible: boolean;
};

type Filters = {
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
const characteristicOptions = productCharacteristicsArray.filter((characteristic) =>
    products.some((product) => product.characteristics.includes(characteristic))
);

const buildDefaultFilters = (): Filters => ({
    category: "",
    brands: [],
    characteristics: [],
    priceMinInput: "",
    priceMaxInput: "",
    ratingMin: 0,
});

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const parsePriceInput = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
        return null;
    }

    const parsedValue = Number(trimmedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
};

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

export function Products() {
    const [feedback, setFeedback] = useState<FeedbackState>({
        message: "",
        type: "",
        isVisible: false,
    });
    const [filters, setFilters] = useState<Filters>(() => buildDefaultFilters());
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

    const handleCharacteristicToggle = (characteristic: ProductCharacteristics) => {
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
                minValue !== null &&
                    maxValue !== null &&
                    minValue > maxValue
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
                minValue !== null &&
                    maxValue !== null &&
                    maxValue < minValue
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

    const priceMinValue = parsePriceInput(filters.priceMinInput);
    const priceMaxValue = parsePriceInput(filters.priceMaxInput);
    const priceHint =
        priceMinValue === null && priceMaxValue === null
            ? "Any price"
            : `${priceMinValue !== null ? formatPrice(priceMinValue) : "Any"} - ${priceMaxValue !== null ? formatPrice(priceMaxValue) : "Any"
            }`;

    return (
        <>
            <a className="skip-link" href="#products-main">
                Skip to main content
            </a>

            <Header onFeedback={showFeedback} />

            <div
                className={`interaction-feedback ${feedback.isVisible ? "is-visible" : ""
                    }`}
                data-state={feedback.type}
                aria-live="polite"
                role="status"
            >
                {feedback.message}
            </div>

            <main id="products-main" className="products-page" tabIndex={-1}>
                <div className="products-layout">
                    <aside
                        className={`filters-sidebar ${isSidebarOpen ? "is-open" : "is-collapsed"}`}
                        aria-label="Product filters"
                    >
                        <div className="filters-header">
                            <div>
                                <p className="filters-eyebrow">Refine</p>
                                <h2>Filters</h2>
                                <div className="filters-meta">
                                    <span>
                                        {filteredProducts.length} of {products.length} items
                                    </span>
                                    {activeFilterCount > 0 ? (
                                        <span className="filters-active">
                                            {activeFilterCount} active
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <button
                                className="filters-toggle"
                                type="button"
                                aria-expanded={isSidebarOpen}
                                aria-controls="filters-panel"
                                onClick={() => setIsSidebarOpen((current) => !current)}
                            >
                                <i
                                    className={`fa-solid ${isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"}`}
                                    aria-hidden="true"
                                ></i>
                                <span>{isSidebarOpen ? "Collapse" : "Expand"}</span>
                            </button>
                        </div>

                        <ActivityIndicator isVisible={isPending} />

                        <div
                            className="filters-panel"
                            id="filters-panel"
                            hidden={!isSidebarOpen}
                        >
                            <fieldset className="filters-group">
                                <legend>Category</legend>
                                <div className="filters-select">
                                    <select
                                        value={filters.category}
                                        onChange={(event) =>
                                            handleCategoryChange(event.target.value)
                                        }
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
                                                    onChange={() => handleBrandToggle(brand)}
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
                                            onChange={(event) =>
                                                handlePriceMinChange(event.target.value)
                                            }
                                        />
                                    </label>
                                    <label>
                                        <span>Max</span>
                                        <input
                                            type="number"
                                            step={0.01}
                                            placeholder="Any"
                                            value={filters.priceMaxInput}
                                            onChange={(event) =>
                                                handlePriceMaxChange(event.target.value)
                                            }
                                        />
                                    </label>
                                </div>
                                <p className="filters-range-hint">
                                    {priceHint}
                                </p>
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
                                                    onChange={() => handleCharacteristicToggle(characteristic)}
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
                                        onChange={(event) =>
                                            handleRatingChange(Number(event.target.value))
                                        }
                                    />
                                    <span>{filters.ratingMin.toFixed(1)}+ stars</span>
                                </div>
                            </fieldset>

                            <div className="filters-actions">
                                <button type="button" onClick={handleClearFilters}>
                                    Clear all
                                </button>
                            </div>
                        </div>
                    </aside>

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
                                        {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="products-empty">
                                <h3>No matches found</h3>
                                <p>
                                    Try clearing a filter or widening the price and rating range.
                                </p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard
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
