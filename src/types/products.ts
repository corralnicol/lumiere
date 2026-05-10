export interface Product {
    id: number | string;
    category: string; // TODO: Use union of string literals
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

export const productCharacteristicsArray = [
    "sunscreen",
    "anti-aging",
    "soothing",
    "anti-acne",
    "moisturizer",
    "hypoallergenic",
    "vegan",
    "cruelty-free",
    "fragrance-free",
    "long-lasting",
    "water-resistant",
    "paraben-free",
] as const;

export type ProductCharacteristics = typeof productCharacteristicsArray[number];

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