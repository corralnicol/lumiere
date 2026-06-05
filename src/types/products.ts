import type { categories } from "@/data/categories";
import { productCharacteristics } from "@/data/characteristics";

export interface Product {
    id: string;
    category: ProductCategory;
    brand: string;
    name: string;
    description: string;
    rating: number;
    price: number;
    size?: string;
    stock: number;
    reviews: ProductReview[];
    localImage?: string;
    imageUrl?: string;
    characteristics: ProductCharacteristics[];
};

export interface ProductReview {
    user: string;
    rating: number;
    comment: string;
}

export type ProductCharacteristics = typeof productCharacteristics[number];

export type ProductCategory = typeof categories[number];

export const hasRequiredFields = (product: Partial<Product>): product is Product => {
    return Boolean(
        product &&
        product.id !== undefined &&
        product.category &&
        product.name &&
        product.brand &&
        typeof product.price === "number"
    );
};