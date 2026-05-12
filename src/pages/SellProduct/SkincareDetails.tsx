import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./SkincareDetails.module.css";
import SellNavbar from "../../components/Navbar/SellNavbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import { productCharacteristics as characteristics } from "@/data/characteristics";
import { capitalize } from "@/utils/strings";

const SkincareDetails = () => {

    const searchParams = useSearchParams();
    const navigate = useNavigate();
    const category = searchParams[0].get("category");

    const [selected, setSelected] = useState<string[]>([]);
    const [form, setForm] = useState({ name: '', brand: '', price: '', size: '', stock: '' });

    const toggleChar = (char: string) => {
        setSelected(prev =>
            prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
        );
    };

    const handleField = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const canSend = selected.length > 0 && form.name.trim() && form.brand.trim() && form.price.trim();

    const handleSend = () => {
        if (!canSend) return;
        const params = new URLSearchParams({
            category: category ?? '',
            characteristics: selected.join(','),
            name: form.name,
            brand: form.brand,
            price: form.price,
            ...(form.size && { size: form.size }),
            ...(form.stock !== '' && { stock: form.stock }),
        });
        navigate(`/sell/success?${params}`);
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

                {/* Banner 1: Características */}
                <section className={styles.heroBanner}>
                    <h2 className={styles.heroTitle}>
                        In which skincare characteristics is <br /> your product?
                    </h2>
                </section>

                {/* Grid de Características con iconos decorativos */}
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

                {/* Product Details Form */}
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
                    </div>
                </section>

                {/* Banner 2: Búsqueda */}
                <section className={styles.searchBanner}>
                    <div className={styles.searchBannerContent}>
                        <h3 className={styles.searchTitle}>The more details, the better!</h3>
                        <p className={styles.searchSubtitle}>To make it faster, search for your product in our catalog.</p>
                    </div>
                </section>

                {/* Métodos de búsqueda con tus iconos SVG */}
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
                        <button
                            className={canSend ? styles.sendButton : styles.sendButtonDisabled}
                            onClick={handleSend}
                            disabled={!canSend}
                        >
                            Send
                        </button>
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
