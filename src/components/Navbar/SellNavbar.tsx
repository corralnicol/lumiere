import { Link } from "react-router-dom";
import styles from "./SellNavbar.module.css";

const SellNavbar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.left}>
                <Link to="/" className={styles.logoText}>Lumière</Link>
                <img src="/images/sellproducts/logo hada.png" alt="Logo Hada" className={styles.hadaLogo} />
            </div>
            
            <div className={styles.right}>
                <a href="#" className={styles.navLink}>Help</a>
                <span className={styles.divider}></span>
                <a href="#" className={styles.navLink}>Profile</a>
            </div>
        </nav>
    );
};

export default SellNavbar;
