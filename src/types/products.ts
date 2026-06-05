import { categories } from "@/data/categories";
import { productCharacteristics } from "@/data/characteristics";

export interface Product {
    id: string;
    category: ProductCategory | null;
    brand: string;
    name: string;
    description: string;
    howToUse?: string;
    ingredients?: string;
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

export type ProductCategory = typeof categories[number]["id"];
