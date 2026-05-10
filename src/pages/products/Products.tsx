import { useEffect, useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import productsData from "@/data/products.json";
import "./Products.css";
import { type Product, hasRequiredFields } from "@/types/products";
import { ProductCard } from "@/components/ProductCard";

export interface FeedbackState {
    message: string;
    type: "info" | "success" | "warning" | "";
    isVisible: boolean;
};

const rawProducts = productsData as Product[];

const products = rawProducts.filter(hasRequiredFields);

export function Products() {
    const [feedback, setFeedback] = useState<FeedbackState>({
        message: "",
        type: "",
        isVisible: false,
    });

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

                <section className="products-grid-section" aria-label="Product list">
                    <div className="products-grid">
                        {products.map((product, index) => (
                            <ProductCard product={product} index={index} key={product.id} />
                        ))}
                    </div>
                </section>
            </main>

            <Footer onFeedback={showFeedback} />
        </>
    );
}

export default Products;
