import styles from "./CategorySelection.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { useNavigate } from "react-router-dom";

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

    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <SellNavbar />

            <main className={styles.main}>
                {/* Banner de Inicio con fondo de imagen */}
                <section className={styles.banner}>
                    <div className={styles.bannerContent}>
                        <h2 className={styles.bannerTitle}>Start selling on Lumière Beauty</h2>
                        <p className={styles.bannerSubtitle}>
                            Publish your first product and connect with thousands of customers!
                        </p>
                    </div>
                </section>

                {/* Selección de Categoría */}
                <section className={styles.selectionSection}>
                    <h3 className={styles.selectionTitle}>Before we begin, what do you want to post?</h3>
                    
                    <div className={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <button key={cat.id} className={styles.categoryCard} onClick={() => navigate(`/sell/details?category=${cat.id}`)}>
                                <div className={styles.iconWrapper}>
                                    <img src={cat.icon} alt={cat.name} className={styles.categoryIcon} />
                                </div>
                                <span className={styles.categoryName}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Texto legal */}
                <hr className={styles.dividerLine} />
                <p className={styles.legalNotice}>
                    By posting, you agree to <strong>Lumière Beauty's Terms and Conditions</strong>. 
                    See how we protect your privacy in our <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                </p>
            </main>

            <AuthFooter />
        </div>
    );
};

export default CategorySelection;
