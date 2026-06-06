import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CreateAccount.module.css";
import Navbar from "../../components/Navbar/Navbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { useUserState } from "@/contexts/user/useUser";
import { signUp } from "@/lib/auth";

const CreateAccount = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(true);
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const user = useUserState();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.loading && user.isLoggedIn) {
            navigate("/account", { replace: true });
        }
    }, [navigate, user.loading, user.isLoggedIn]);

    const handleCreateAccount = async () => {
        const trimmedEmail = email.trim();
        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();
        const trimmedPhone = phone.trim();
        if (!trimmedEmail || !trimmedFirstName || !trimmedLastName || !trimmedPhone || !password) return;

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const result = await signUp({
                email: trimmedEmail,
                password,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                phone: trimmedPhone,
            });

            if (result.error) {
                setError(result.error);
            } else if (result.message) {
                setSuccess(result.message);
            }
        } catch {
            setError("Could not create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = Boolean(email.trim() && firstName.trim() && lastName.trim() && phone.trim() && password && accepted && !loading);

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Create your account!</h2>

                    <button className={styles.googleBtn} type="button">
                        <img
                            src="/images/login/google.svg"
                            alt="Google"
                            className={styles.googleIcon}
                        />
                        Sign up with Google
                    </button>

                    <div className={styles.divider}>
                        <span className={styles.dividerLine}></span>
                        <p className={styles.dividerText}>Or enter your email</p>
                        <span className={styles.dividerLine}></span>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            className={styles.input}
                            placeholder=""
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            className={styles.input}
                            placeholder=""
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                        />
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
                        <label className={styles.label} htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            className={styles.input}
                            placeholder=""
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
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

                    {error && <p className={styles.legalText} style={{ color: 'red' }}>{error}</p>}
                    {success && <p className={styles.legalText} style={{ color: '#2f7a45' }}>{success}</p>}

                    <button className={styles.createBtn} onClick={handleCreateAccount} disabled={!canSubmit}>
                        {loading ? "Creating account..." : "Sign up"}
                    </button>

                    <p className={styles.loginRedirect}>
                        Have an account?{" "}
                        <Link to="/auth/sign-in" className={styles.loginLink}>Sign in</Link>
                    </p>
                </div>
            </main>

            <AuthFooter />
        </div>
    );
};

export default CreateAccount;
