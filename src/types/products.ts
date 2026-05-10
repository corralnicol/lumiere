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
};

export interface ProductReview {
    user: string;
    rating: number;
    comment: string;
}

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