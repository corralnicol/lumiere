import { type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getProductImageSrc } from "@/utils/productImages";
import type { Product } from "@/types/products";
import { categories } from "@/data/categories";

const buildSearchTarget = (product: Product) => {
    return [
        product.brand,
        product.name,
        product.category,
        product.description,
    ]
        .filter(Boolean)
        .join(" ");
};

const getCategoryLabel = (categoryId: string | null): string => {
    if (!categoryId) return "Kit";
    return categories.find(c => c.id === categoryId)?.label ?? categoryId;
};

export function ProductCard({ product, index }: { product: Product; index?: number }) {
    const sizeLabel = product.size || "Standard size";
    const stockLabel = product.stock > 0 ? `${product.stock} left` : "Unavailable";
    const stockState = product.stock <= 20 ? "low" : "ok";
    const rating = product.rating ?? 0;

    return (
        <Link
            to={`/products/${product.id}`}
            className="product-card"
            data-search-target={buildSearchTarget(product)}
            style={{ animationDelay: `${index ?? 1} * 0.04}s` } as CSSProperties}
        >
            <div className="product-card-media">
                <span className="product-card-tag">
                    {getCategoryLabel(product.category)}
                </span>
                <img
                    src={getProductImageSrc(product)}
                    alt={product.name}
                />
            </div>

            <div className="product-card-body">
                <h3>{product.brand}</h3>
                <p className="product-card-name">{product.name}</p>

                <div
                    className="product-card-rating"
                    aria-label={`${rating} stars`}
                >
                    <div className="product-card-stars">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <i
                                className={
                                    index < Math.round(rating)
                                        ? "fa-solid fa-star"
                                        : "fa-regular fa-star"
                                }
                                aria-hidden="true"
                                key={index}
                            ></i>
                        ))}
                    </div>
                    <span>{rating.toFixed(1)}</span>
                </div>

                <div className="product-card-footer">
                    <span className="product-card-price">
                        ${Number(product.price).toFixed(2)}
                    </span>
                </div>

                <div className="product-card-badges">
                    <span>{sizeLabel}</span>
                    <span className="product-card-stock" data-state={stockState}>
                        {stockLabel}
                    </span>
                </div>
            </div>
        </Link>
    );
}