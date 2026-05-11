import styles from "./CategorySelection.module.css";
import Navbar from "../../components/Navbar/Navbar";
import AuthFooter from "../../components/Footer/AuthFooter";

const CategorySelection = () => {
    const categories = [
        { id: "base", name: "Base", icon: "/images/categories/foundation.png" },
        { id: "contour", name: "Contour", icon: "/images/categories/contour.png" },
        { id: "blush", name: "Blush", icon: "/images/categories/blush.png" },
        { id: "eyelash", name: "Eyelash", icon: "/images/categories/eyelash.png" },
        { id: "lip", name: "Lip", icon: "/images/categories/lip.png" },
        { id: "eyeshadows", name: "Eyeshadows", icon: "/images/categories/eyeshadow.png" },
        { id: "eyeliners", name: "Eyeliners", icon: "/images/categories/eyeliner.png" },
        { id: "corrector", name: "Corrector", icon: "/images/categories/concealer.png" },
    ];

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.main}>
                {/* Banner de Inicio */}
                <section className={styles.banner}>
                    <div className={styles.bannerContent}>
                        <h2 className={styles.bannerTitle}>Start selling on Lumière Beauty</h2>
                        <p className={styles.bannerSubtitle}>
                            Publish your first product and connect with thousands of customers!
                        </p>
                    </div>
                    <div className={styles.bannerImageContainer}>
                        <img src="/images/sell/cart-banner.png" alt="Cart" className={styles.bannerImage} />
                    </div>
                </section>

                {/* Selección de Categoría */}
                <section className={styles.selectionSection}>
                    <h3 className={styles.selectionTitle}>Before we begin, what do you want to post?</h3>
                    
                    <div className={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <button key={cat.id} className={styles.categoryCard}>
                                <div className={styles.iconWrapper}>
                                    <img src={cat.icon} alt={cat.name} className={styles.categoryIcon} />
                                </div>
                                <span className={styles.categoryName}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Texto legal */}
                <p className={styles.legalNotice}>
                    By posting, you agree to <strong>Lumière Beauty's Terms and Conditions</strong>. 
                    See how we protect your privacy in our <a href="#">Privacy Policy</a>.
                </p>
            </main>

            <AuthFooter />
        </div>
    );
};

export default CategorySelection;
