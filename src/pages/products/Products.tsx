import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { categories } from "@/data/categories";
import "./Products.css";
import {
    type Product,
    type ProductCharacteristics,
} from "@/types/products";
import { productCharacteristics } from "@/data/characteristics";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

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

const toggleValue = <T extends string>(values: T[], value: T) => {
    return values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
};

const clampValue = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

const emptyFilters: Filters = {
    category: "",
    brands: [],
    characteristics: [],
    priceMinInput: "",
    priceMaxInput: "",
    ratingMin: 0,
};

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

    return categories.find((category) => category.id.toLowerCase() === normalizedValue)?.id ?? "";
};

interface FiltersSidebarProps {
    filters: Filters;
    isSidebarOpen: boolean;
    isPending: boolean;
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

export function FiltersSidebar({
    filters,
    isSidebarOpen,
    isPending,
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
            : `${priceMinValue !== null ? formatPrice(priceMinValue) : "Any"} - ${priceMaxValue !== null ? formatPrice(priceMaxValue) : "Any"
            }`;

    return (
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
                        className={`fa-solid ${isSidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
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
                            {categories.map((c) => (
                                <option value={c.id} key={c.id}>
                                    {c.label}
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
                                        checked={filters.characteristics.includes(
                                            characteristic
                                        )}
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

export function Products() {
    const [searchParams] = useSearchParams();
    const resolvedCategoryFromQuery = resolveCategoryFromQueryParam(
        searchParams.get("category")
    );

    const { data: products, loading, error } = useProducts();

    const [feedback, setFeedback] = useState<FeedbackState>({
        message: "",
        type: "",
        isVisible: false,
    });
    const [filters, setFilters] = useState<Filters>(() => ({
        ...emptyFilters,
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
            setFilters(emptyFilters);
        });
        showFeedback("Filters cleared. Showing all products.", "info");
    };

    const brandFilterOptions = useMemo(() => {
        return [...new Set(products.filter((p) => p.brand).map((p) => p.brand.trim()))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
    }, [products]);

    const characteristicFilterOptions = useMemo(() => {
        return productCharacteristics.filter((c) =>
            products.some((p) => p.characteristics.includes(c))
        );
    }, [products]);

    const filteredProducts = useMemo((): Product[] => {
        const sorted = [...products].sort((a, b) => b.stock - a.stock);

        return sorted.filter((product) => {
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
    }, [filters, products]);

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

    const renderGrid = () => {
        if (error) {
            return (
                <div className="products-empty">
                    <h3>Could not load products</h3>
                    <p>{error}</p>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="products-loading" role="status" aria-live="polite">
                    <span className="activity-spinner" aria-hidden="true"></span>
                    <span>Loading products…</span>
                </div>
            );
        }

        if (filteredProducts.length === 0) {
            return (
                <div className="products-empty">
                    <h3>No matches found</h3>
                    <p>
                        Try clearing a filter or widening the price and rating range.
                    </p>
                </div>
            );
        }

        return (
            <div className="products-grid">
                {filteredProducts.map((product, index) => (
                    <ProductCard
                        product={product}
                        index={index}
                        key={product.id}
                        onFeedback={showFeedback}
                    />
                ))}
            </div>
        );
    };

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
                    <FiltersSidebar
                        filters={filters}
                        isSidebarOpen={isSidebarOpen}
                        isPending={isPending}
                        brandOptions={brandFilterOptions}
                        characteristicOptions={characteristicFilterOptions}
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
                                        {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
                                    </span>
                                ) : null}
                            </div>
                        </div>

                        {renderGrid()}
                    </section>
                </div>
            </main>

            <Footer onFeedback={showFeedback} />
        </>
    );
}

export default Products;
