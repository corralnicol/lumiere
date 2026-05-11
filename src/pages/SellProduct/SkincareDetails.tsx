import { Link } from "react-router-dom";
import styles from "./SkincareDetails.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";

const SkincareDetails = () => {
    const characteristics = [
        "Anti - ance", "Moisturizer", "Hypoallergenic",
        "Sunscreen", "Anti - aging", "Soothing",
        "Gluten free", "Cruelty free", "Vegan"
    ];

    return (
        <div className={styles.container}>
            <SellNavbar />

            <main className={styles.main}>
                {/* Botón de retroceso */}
                <div className={styles.backNavigation}>
                    <Link to="/sell" className={styles.backLink}>
                        <i className="fa-solid fa-chevron-left"></i> Product type
                    </Link>
                </div>

                {/* Banner 1: Características */}
                <section className={styles.heroBanner}>
                    <h2 className={styles.heroTitle}>
                        In which skincare characteristics is <br /> your product?
                    </h2>
                </section>

                {/* Grid de Características */}
                <section className={styles.characteristicsSection}>
                    {/* Aquí irán los iconos decorativos que se ven en el mockup */}
                    <div className={styles.gridContainer}>
                        {characteristics.map((char, index) => (
                            <button key={index} className={styles.charButton}>
                                {char}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Banner 2: Búsqueda */}
                <section className={styles.searchBanner}>
                    <div className={styles.searchBannerContent}>
                        <h3 className={styles.searchTitle}>The more details, the better!</h3>
                        <p className={styles.searchSubtitle}>To make it faster, search for your product in our catalog.</p>
                    </div>
                </section>

                {/* Métodos de búsqueda */}
                <section className={styles.searchMethods}>
                    <div className={styles.methodsContainer}>
                        <button className={styles.methodCard}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>by keywords</span>
                        </button>
                        <button className={styles.methodCard}>
                            <i className="fa-solid fa-camera"></i>
                            <span>By photo</span>
                        </button>
                        <button className={styles.methodCard}>
                            <i className="fa-solid fa-barcode"></i>
                            <span>By code</span>
                        </button>
                    </div>

                    <div className={styles.inputWrapper}>
                        <input 
                            type="text" 
                            placeholder="Ex: Garnier foundation with sunscreen." 
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.actionRow}>
                        <button className={styles.sendButton}>Send</button>
                    </div>
                </section>

                {/* Legal Notice */}
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

export default SkincareDetails;
