import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./SkincareDetails.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { productCharacteristics as characteristics } from "@/data/characteristics";
import { capitalize } from "@/utils/strings";
import { createProduct } from "@/lib/products";
import { useUserState } from "@/contexts/user/useUser";

const SkincareDetails = () => {

    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const category = searchParams[0].get("category");
    const user = useUserState();

    const [selected, setSelected] = useState<string[]>([]);
    const [form, setForm] = useState({
        name: '',
        brand: '',
        price: '',
        size: '',
        stock: '',
        description: '',
        howToUse: '',
        ingredients: '',
        imageUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleChar = (char: string) => {
        setSelected(prev =>
            prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
        );
    };

    const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const canSend = selected.length > 0 && form.name.trim() && form.brand.trim() && form.price.trim();

    const handleSend = async () => {
        if (!canSend || submitting) return;
        if (!user.isLoggedIn || !user.id) {
            navigate("/auth/sign-in");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await createProduct(
                {
                    name: form.name.trim(),
                    brand: form.brand.trim(),
                    price: Number(form.price),
                    size: form.size || undefined,
                    stock: form.stock === '' ? undefined : Number(form.stock),
                    category,
                    characteristics: selected,
                    description: form.description || undefined,
                    howToUse: form.howToUse || undefined,
                    ingredients: form.ingredients || undefined,
                    imageUrl: form.imageUrl || null,
                },
                user.id,
            );
            navigate("/sell/success");
        } catch (e) {
            setError("Could not publish product. Please try again.");
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

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

                {/* Sección 1: Características */}
                <section className={styles.heroBanner}>
                    <h2 className={styles.heroTitle}>
                        In which skincare characteristics is <br /> your product?
                    </h2>
                </section>

                {/* Cuadrícula de características con iconos decorativos */}
                <section className={styles.characteristicsSection}>
                    {/* Iconos decorativos flotantes */}
                    <img src="/images/characteristcs/icono sol.svg" alt="" className={styles.decorIconSunTop} />
                    <img src="/images/characteristcs/icono crema.svg" alt="" className={styles.decorIconCreamLeft} />
                    <img src="/images/characteristcs/icono rostro.svg" alt="" className={styles.decorIconFaceRight} />
                    <img src="/images/characteristcs/icono rostro.svg" alt="" className={styles.decorIconFaceBottom} />
                    <img src="/images/characteristcs/icono crema.svg" alt="" className={styles.decorIconCreamBottom} />
                    <img src="/images/characteristcs/icono sol.svg" alt="" className={styles.decorIconSunBottom} />

                    <div className={styles.gridContainer}>
                        {characteristics.map((char, index) => (
                            <button
                                key={index}
                                className={selected.includes(char) ? styles.charButtonSelected : styles.charButton}
                                onClick={() => toggleChar(char)}
                            >
                                {capitalize(char)}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Formulario de detalles del producto */}
                <section className={styles.productDetailsSection}>
                    <h3 className={styles.detailsTitle}>Product details</h3>
                    <div className={styles.detailsGrid}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Name <span className={styles.required}>*</span></label>
                            <input name="name" value={form.name} onChange={handleField}
                                placeholder="e.g. Vitamin C Serum" className={styles.fieldInput} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Brand <span className={styles.required}>*</span></label>
                            <input name="brand" value={form.brand} onChange={handleField}
                                placeholder="e.g. The Ordinary" className={styles.fieldInput} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Price <span className={styles.required}>*</span></label>
                            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleField}
                                placeholder="0.00" className={styles.fieldInput} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Size <span className={styles.optional}>(optional)</span></label>
                            <input name="size" value={form.size} onChange={handleField}
                                placeholder="e.g. 30ml" className={styles.fieldInput} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Stock <span className={styles.optional}>(optional)</span></label>
                            <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleField}
                                placeholder="0" className={styles.fieldInput} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Image URL <span className={styles.optional}>(optional)</span></label>
                            <input name="imageUrl" value={form.imageUrl} onChange={handleField}
                                placeholder="https://..." className={styles.fieldInput} />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                            <label className={styles.fieldLabel}>Description <span className={styles.optional}>(optional)</span></label>
                            <textarea name="description" value={form.description} onChange={handleField}
                                placeholder="Describe your product..." className={styles.fieldInput} rows={3} />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                            <label className={styles.fieldLabel}>How to use <span className={styles.optional}>(optional)</span></label>
                            <textarea name="howToUse" value={form.howToUse} onChange={handleField}
                                placeholder="Application instructions..." className={styles.fieldInput} rows={3} />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                            <label className={styles.fieldLabel}>Ingredients <span className={styles.optional}>(optional)</span></label>
                            <textarea name="ingredients" value={form.ingredients} onChange={handleField}
                                placeholder="Aqua, Glycerin, Niacinamide..." className={styles.fieldInput} rows={3} />
                        </div>
                    </div>
                </section>

                {/* Sección 2: Búsqueda */}
                <section className={styles.searchBanner}>
                    <div className={styles.searchBannerContent}>
                        <h3 className={styles.searchTitle}>The more details, the better!</h3>
                        <p className={styles.searchSubtitle}>To make it faster, search for your product in our catalog.</p>
                    </div>
                </section>

                {/* Métodos de búsqueda con iconos */}
                <section className={styles.searchMethods}>
                    <div className={styles.methodsContainer}>
                        <button className={styles.methodCard}>
                            <img src="/images/characteristcs/icono Search.svg" alt="Search" className={styles.methodIcon} />
                            <span>by keywords</span>
                        </button>
                        <button className={styles.methodCard}>
                            <img src="/images/characteristcs/icono Camera.svg" alt="Camera" className={styles.methodIcon} />
                            <span>By photo</span>
                        </button>
                        <button className={styles.methodCard}>
                            <img src="/images/characteristcs/icono code.svg" alt="Code" className={styles.methodIcon} />
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
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button
                            className={canSend && !submitting ? styles.sendButton : styles.sendButtonDisabled}
                            onClick={handleSend}
                            disabled={!canSend || submitting}
                        >
                            {submitting ? "Publishing..." : "Send"}
                        </button>
                    </div>
                </section>

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

export default SkincareDetails;
