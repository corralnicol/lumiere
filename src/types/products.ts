import { categories } from "@/data/categories";
import { productCharacteristics } from "@/data/characteristics";

export interface Product {
    id: string;
    category: ProductCategory | null;
    brand: string;
    name: string;
    description: string;
    howToUse: string;
    ingredients: string;
    rating: number;
    price: number;
    size: string;
    stock: number;
    active: boolean;
    sellerId: string;
    imageUrl: string | null;
    reviews: ProductReview[];
    characteristics: ProductCharacteristics[];
    createdAt: string;
}

export interface ProductReview {
    reviewer_id: string;
    reviewer_name: string | null;
    rating: number;
    text: string;
    created_at?: string;
}

export type ProductCharacteristics = typeof productCharacteristics[number];

export type ProductCategory = typeof categories[number]["id"];
