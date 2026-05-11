import styles from "./AuthFooter.module.css";

function AuthFooter() {
    return (
        <footer className={styles.footer}>
            <p className={styles.privacy}>How we protect your privacy</p>
            <p className={styles.copyright}>
                Copyright © 2026-2026 Lumière Colombia LTDA
            </p>
        </footer>
    );
}

export default AuthFooter;
