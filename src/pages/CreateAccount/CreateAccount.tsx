import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./CreateAccount.module.css";
import Navbar from "../../components/Navbar/Navbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { useUserActions, useUserState } from "@/contexts/user/UserContext";

const CreateAccount = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [accepted, setAccepted] = useState(true);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const user = useUserState();
    const actions = useUserActions();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.isLoggedIn) {
            navigate("/account", { replace: true });
        }
    }, [navigate, user?.isLoggedIn]);

    const handleCreateAccount = () => {
        if (!actions) {
            return;
        }

        const trimmedEmail = email.trim();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        if (!trimmedEmail || !trimmedName) {
            return;
        }

        actions.login({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            isLoggedIn: true,
        });

        navigate("/account", { replace: true });
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Create your account!</h2>

                    {/* Botón Google */}
                    <button className={styles.googleBtn} type="button">
                        <img
                            src="/images/login/google.svg"
                            alt="Google"
                            className={styles.googleIcon}
                        />
                        Sign up with Google
                    </button>

                    {/* Divisor */}
                    <div className={styles.divider}>
                        <span className={styles.dividerLine}></span>
                        <p className={styles.dividerText}>Or enter your email</p>
                        <span className={styles.dividerLine}></span>
                    </div>

                    {/* Campo E-mail */}
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

                    {/* Campo Teléfono */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="tel">Tel</label>
                        <input
                            id="tel"
                            type="tel"
                            className={styles.input}
                            placeholder=""
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                        />
                    </div>

                    {/* Campo Nombre */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            className={styles.input}
                            placeholder=""
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>

                    {/* Campo Contraseña */}
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

                    {/* Checkbox */}
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

                    {/* Botón Crear Cuenta */}
                    <button className={styles.createBtn} onClick={handleCreateAccount}>
                        Create account
                    </button>

                    {/* Enlace volver al login */}
                    <p className={styles.loginRedirect}>
                        Have an account?{" "}
                        <Link to="/login" className={styles.loginLink}>Log in</Link>
                    </p>
                </div>
            </main>

            <AuthFooter />
        </div>
    );
};

export default CreateAccount;
