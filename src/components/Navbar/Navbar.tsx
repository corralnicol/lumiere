import styles from "./Navbar.module.css";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <Link to="/" className={styles.logoLink}>
                <h1 className={styles.logo}>Lumière</h1>
            </Link>
        </nav>
    );
};

export default Navbar;
