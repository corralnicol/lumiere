import { Link } from "react-router-dom";
import styles from "./SuccessPublish.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";

const SuccessPublish = () => {
    return (
        <div className={styles.container}>
            <SellNavbar />

            <main className={styles.main}>
                {/* Imagen de éxito con el check flotante */}
                <div className={styles.imageContainer}>
                    <div className={styles.successImageWrapper}>
                        <img 
                            src="/images/characteristcs/make up 6.svg" 
                            alt="Success" 
                            className={styles.successImage} 
                        />
                    </div>
                    <div className={styles.checkIconWrapper}>
                        <i className="fa-solid fa-check"></i>
                    </div>
                </div>

                {/* Mensaje de éxito */}
                <div className={styles.messageContent}>
                    <h2 className={styles.successTitle}>Your product is now on sale!!</h2>
                    <p className={styles.successDescription}>
                        Your product has been published on Lumiere Beauty <br />
                        and is now available for customers to find and purchase.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className={styles.actions}>
                    <Link to="/" className={styles.acceptButton}>
                        Accept
                    </Link>
                    <Link to="/sell" className={styles.publishMoreButton}>
                        Publish another product
                    </Link>
                </div>

                {/* Aviso legal */}
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

export default SuccessPublish;
