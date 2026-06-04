import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Navbar from "../../components/Navbar/Navbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { useUserState } from "@/contexts/user/UserContext";
import { signIn, signInWithGoogle } from "@/lib/auth";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const user = useUserState();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.loading && user.isLoggedIn) {
            navigate("/account", { replace: true });
        }
    }, [navigate, user.loading, user.isLoggedIn]);

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) return;

        setError("");
        const errorMsg = await signIn({ email: trimmedEmail, password });
        if (errorMsg) {
            setError(errorMsg);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        const errorMsg = await signInWithGoogle();
        if (errorMsg) {
            setError(errorMsg);
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Sign in</h2>

                    <button className={styles.googleBtn} type="button" onClick={handleGoogleSignIn}>
                        <img
                            src="/images/login/google.svg"
                            alt="Google"
                            className={styles.googleIcon}
                        />
                        Sign in with Google
                    </button>

                    <div className={styles.divider}>
                        <span className={styles.dividerLine}></span>
                        <p className={styles.dividerText}>Or enter your email</p>
                        <span className={styles.dividerLine}></span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            placeholder=""
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={styles.input}
                                placeholder=""
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.eyeBtn}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Mostrar contraseña"
                            >
                                <img
                                    src="/images/login/passwordOff.svg"
                                    alt="mostrar/ocultar contraseña"
                                />
                            </button>
                        </div>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={() => setAccepted(!accepted)}
                                className={styles.checkbox}
                            />
                            <img
                                src="/images/login/check.svg"
                                alt=""
                                className={styles.checkIcon}
                            />
                            I accept being contacted via SMS and WhatsApp.
                        </label>
                        <p className={styles.legalText}>
                            By clicking "Continue", I authorize the use of my data in accordance with the
                            Privacy Statement and accept the{" "}
                            <a href="#" className={styles.legalLink}>Terms and Conditions</a>
                            {" "}and the{" "}
                            <a href="#" className={styles.legalLink}>Data Processing Authorization</a>.
                        </p>
                    </div>

                    {error && <p className={styles.error ?? styles.legalText} style={{ color: 'red' }}>{error}</p>}

                    <button className={styles.loginBtn} onClick={handleLogin}>
                        Sign in
                    </button>

                    <p className={styles.createAccount}>
                        Don't have an account?{" "}
                        <Link to="/auth/sign-up" className={styles.createLink}>Sign up</Link>
                    </p>
                </div>
            </main>

            <AuthFooter />
        </div>
    );
};

export default Login;
