import { useState, type SubmitEvent } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "./Seller.css";
import { Link } from "react-router-dom";
import { useUserState } from "@/contexts/user/useUser";

type FeedbackType = "info" | "success" | "warning";

const faqItems = [
    {
        id: "start",
        question: "How do I start selling on Lumière?",
        answer:
            "Create your seller profile, add your product information, upload product images, and publish your listing when everything is ready.",
    },
    {
        id: "pricing",
        question: "How much does it cost to sell on Lumière?",
        answer:
            "Choose a sales plan based on your needs. The Individual plan is per sale, and the Professional plan has a monthly fee plus selling fees.",
    },
    {
        id: "manage",
        question: "How do I manage customer orders?",
        answer:
            "Track, fulfill, and update orders from your seller dashboard. You can manage shipping, returns, and customer messages in one place.",
    },
    {
        id: "payment",
        question: "How do I receive payment for my sales on Lumière?",
        answer:
            "Payments are deposited to the bank account you connect during onboarding, based on your payout schedule.",
    },
];

function HeroAction() {
    const user = useUserState();
    const link = user?.isLoggedIn ? "/sell" : "/auth/sign-up";
    const label = user?.isLoggedIn ? "Manage Your Store" : "Sign Up";

    return (
        <Link to={link} className="seller-hero__register-btn">
            {label}
        </Link>
    );
}

function Seller() {
    const [email, setEmail] = useState("");
    const [newsletterMessage, setNewsletterMessage] = useState("");
    const [newsletterState, setNewsletterState] = useState<"success" | "error" | "">("");
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("info");

    const showFeedback = (message: string, type: FeedbackType = "info") => {
        setFeedbackMessage(message);
        setFeedbackType(type);

        window.setTimeout(() => {
            setFeedbackMessage("");
        }, 2600);
    };

    const handleNewsletterSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !event.currentTarget.checkValidity()) {
            setNewsletterMessage("Enter a valid email address to subscribe.");
            setNewsletterState("error");
            showFeedback("Please enter a valid email address.", "warning");
            return;
        }

        setNewsletterMessage(
            `Thanks, ${trimmedEmail} is now subscribed to Lumière seller updates.`
        );
        setNewsletterState("success");
        showFeedback("Seller newsletter subscription confirmed.", "success");
        setEmail("");
    };

    return (
        <>
            <Header onFeedback={showFeedback} />

            {feedbackMessage && (
                <div
                    className="seller-feedback"
                    data-state={feedbackType}
                    role="status"
                    aria-live="polite"
                >
                    {feedbackMessage}
                </div>
            )}

            <main className="seller-page">
                <section className="seller-hero">
                    <div className="seller-hero__content">
                        <p className="seller-eyebrow">Lumière Seller Program</p>
                        <h1 className="seller-hero__title">Create a Lumière seller account</h1>
                        <p className="seller-hero__subtitle">
                            Bring your beauty brand to a curated marketplace built for visual
                            discovery and trusted shopping experiences.
                        </p>

                        <div className="seller-hero__actions">
                            <HeroAction />
                            <span className="seller-hero__promo">
                                Get 10% off your first $30 brand sale
                            </span>
                        </div>
                    </div>
                </section>

                <section className="seller-stats">
                    <p className="seller-stats__subtitle">
                        More than 80% of Lumière sellers make their first sale in less than
                        60 days.
                    </p>

                    <div className="seller-stats__grid">
                        <article className="seller-stats__card">
                            <p className="seller-stats__number">$20,000+</p>
                            <p className="seller-stats__desc">
                                Average sales on the Lumière store for independent sellers in the
                                US in 2024.
                            </p>
                        </article>

                        <article className="seller-stats__card">
                            <p className="seller-stats__number">More than 60%</p>
                            <p className="seller-stats__desc">
                                Percentage of sales on Lumière from independent sellers, most of
                                whom are small and medium-size businesses.
                            </p>
                        </article>

                        <article className="seller-stats__card">
                            <p className="seller-stats__number">More than 100</p>
                            <p className="seller-stats__desc">
                                Countries and regions where Lumière ships to customers.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="seller-benefits" id="seller-benefits">
                    <div className="seller-benefits__container">
                        <div className="seller-benefits__image-wrap">
                            <img
                                className="seller-benefits__image"
                                src="/images/seller/benefits.png"
                                alt="Beauty seller workspace"
                            />
                        </div>

                        <ul className="seller-benefits__list">
                            <li>
                                <i className="fa-solid fa-star" aria-hidden="true"></i>
                                10% cashback on your first $50,000 brand sale, then 5% cashback
                                for the first year until you reach $1,000,000.
                            </li>
                            <li>
                                <i className="fa-solid fa-star" aria-hidden="true"></i>
                                $100 off shipping to the Fulfillment by Lumière network with the
                                Lumière Partner Carrier Program.
                            </li>
                            <li>
                                <i className="fa-solid fa-star" aria-hidden="true"></i>
                                Free customer storage and returns with automatic enrollment in
                                the Fulfillment by Lumière New Pick program.
                            </li>
                            <li>
                                <i className="fa-solid fa-star" aria-hidden="true"></i>
                                $50 credit toward creating Sponsored Products or Sponsored Brands
                                ads.
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="seller-steps" id="seller-steps">
                    <div className="seller-steps__container">
                        <div className="seller-steps__content">
                            <h2 className="seller-steps__title">Are you ready to begin?</h2>

                            <article className="seller-steps__step">
                                <div className="seller-steps__step-header">
                                    <span className="seller-steps__step-number">Step 1:</span>
                                    <h3>Choose a sales plan</h3>
                                </div>
                                <p>
                                    We offer two sales plans, so you can choose the right package
                                    of tools and services at the right price.
                                </p>
                                <p className="seller-steps__note">
                                    The Individual sales plan costs $1.00 per sale. The Professional
                                    sales plan costs $39.99 per month, regardless of how many items
                                    you sell.
                                </p>
                            </article>

                            <article className="seller-steps__step">
                                <div className="seller-steps__step-header">
                                    <span className="seller-steps__step-number">Step 2:</span>
                                    <h3>Create your Lumière seller account</h3>
                                </div>
                                <p>
                                    Visit lumiere.com and click Sign Up. Then, create the account
                                    using the email address associated with your Lumière customer
                                    account or a separate business email.
                                </p>
                                <p className="seller-steps__note">
                                    Before creating your account, make sure you have the following:
                                </p>
                                <ul className="seller-steps__requirements">
                                    <li>Bank account and routing number</li>
                                    <li>Credit card for international payments</li>
                                    <li>Government-issued ID</li>
                                    <li>Tax information</li>
                                    <li>Phone number</li>
                                </ul>
                                <p className="seller-steps__note">
                                    See our beginner guide for step-by-step instructions on
                                    creating a Lumière seller account.
                                </p>
                            </article>

                            <article className="seller-steps__step">
                                <div className="seller-steps__step-header">
                                    <span className="seller-steps__step-number">Step 3:</span>
                                    <h3>Start selling</h3>
                                </div>
                                <p>
                                    After creating your account, you will have access to Seller
                                    Central and can set up your public seller profile, shipping and
                                    returns, tax, payment, and business information.
                                </p>
                                <p className="seller-steps__note">
                                    Then you can list and price your products, choose a fulfillment
                                    method, and take advantage of tools and programs to promote
                                    products and connect with customers.
                                </p>
                            </article>

                            <a className="seller-steps__learn-more" href="#seller-faq">
                                Learn to sell in Lumière
                                <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
                            </a>
                        </div>

                        <div className="seller-steps__image-wrap">
                            <img
                                className="seller-steps__image"
                                src="/images/seller/steps.png"
                                alt="Beauty tools and workspace"
                            />
                        </div>
                    </div>
                </section>

                <section className="seller-services">
                    <div className="seller-services__grid">
                        <article className="seller-services__card">
                            <div className="seller-services__icon">
                                <i className="fa-solid fa-hand-holding-heart" aria-hidden="true"></i>
                            </div>
                            <h3>Managed by the seller</h3>
                            <p>
                                Use a suite of solutions to save time and money by managing
                                customer orders yourself. Free orders and service tools are
                                included.
                            </p>
                        </article>

                        <article className="seller-services__card">
                            <div className="seller-services__icon">
                                <i className="fa-solid fa-boxes-stacked" aria-hidden="true"></i>
                            </div>
                            <h3>Multichannel logistics</h3>
                            <p>
                                Lumière manages customer orders for purchases made on your own
                                website or through another sales channel.
                            </p>
                        </article>

                        <article className="seller-services__card">
                            <div className="seller-services__icon">
                                <i className="fa-solid fa-truck-fast" aria-hidden="true"></i>
                            </div>
                            <h3>Lumière supply chain</h3>
                            <p>
                                Get your products from manufacturers to customers worldwide. Take
                                advantage of a complete supply chain with faster delivery and
                                more reliable shipping costs.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="seller-testimonials">
                    <div className="seller-testimonials__container">
                        <div className="seller-testimonials__image-wrap">
                            <img
                                className="seller-testimonials__image"
                                src="/images/seller/testimonial1.png"
                                alt="Beauty palette closeup"
                            />
                        </div>

                        <div className="seller-testimonials__quotes">
                            <article className="seller-testimonials__quote-card">
                                <div className="seller-testimonials__quote-header">
                                    <span className="seller-testimonials__avatar">SC</span>
                                    <div>
                                        <p className="seller-testimonials__name">Silvia Cerezo</p>
                                        <p className="seller-testimonials__date">15 Feb 2025</p>
                                    </div>
                                </div>
                                <p className="seller-testimonials__quote">
                                    “Challenges are a sign that something fundamental needs to
                                    change. In our case, it was the way we sold our products; we
                                    had to start selling online.”
                                </p>
                            </article>

                            <article className="seller-testimonials__quote-card">
                                <div className="seller-testimonials__quote-header">
                                    <span className="seller-testimonials__avatar">LN</span>
                                    <div>
                                        <p className="seller-testimonials__name">Leena Neal</p>
                                        <p className="seller-testimonials__date">8 Apr 2025</p>
                                    </div>
                                </div>
                                <p className="seller-testimonials__quote">
                                    “I was confident that there was an interested community for
                                    whom we were important. All we had to do was find it.”
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="seller-faq" id="seller-faq">
                    <h2 className="seller-faq__title">Frequently asked questions</h2>

                    <div className="seller-faq__list">
                        {faqItems.map((item) => {
                            const isOpen = openFaqId === item.id;

                            return (
                                <article className="seller-faq__item" key={item.id}>
                                    <button
                                        className="seller-faq__question"
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                                    >
                                        <span>{item.question}</span>
                                        <i
                                            className={`seller-faq__icon fa-solid ${isOpen ? "fa-minus" : "fa-plus"
                                                }`}
                                            aria-hidden="true"
                                        ></i>
                                    </button>

                                    {isOpen && (
                                        <p className="seller-faq__answer">{item.answer}</p>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="seller-newsletter" id="seller-newsletter">
                    <div className="seller-newsletter__inner">
                        <div>
                            <p className="seller-eyebrow">Lumière updates</p>
                            <h2>Find out about all the promotions we have for you</h2>
                        </div>

                        <form
                            className="seller-newsletter__form"
                            onSubmit={handleNewsletterSubmit}
                        >
                            <div className="seller-newsletter__field">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />

                                <button type="submit">Subscribe</button>
                            </div>

                            <p
                                className="seller-newsletter__message"
                                data-state={newsletterState}
                                aria-live="polite"
                            >
                                {newsletterMessage}
                            </p>
                        </form>
                    </div>
                </section>
            </main>

            <Footer onFeedback={showFeedback} />
        </>
    );
}

export default Seller;
