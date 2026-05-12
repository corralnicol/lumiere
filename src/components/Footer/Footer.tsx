import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { footerPayments, footerSocialLinks } from "../../data/homeContent";

type FooterProps = {
  onFeedback: (message: string, type?: "info" | "success" | "warning") => void;
};

function Footer({ onFeedback }: FooterProps) {
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterState, setNewsletterState] = useState<"success" | "error" | "">("");

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !event.currentTarget.checkValidity()) {
      setNewsletterMessage("Enter a valid email address to subscribe.");
      setNewsletterState("error");
      onFeedback("Newsletter subscription needs a valid email.", "warning");
      return;
    }

    setNewsletterMessage(
      `Thanks, ${trimmedEmail} is now subscribed to Lumiere updates.`
    );
    setNewsletterState("success");
    onFeedback("Newsletter subscription confirmed.", "success");
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="footer-newsletter" id="newsletter">
        <div className="newsletter-text">
          <p>Find out about all the promotions we have for you</p>
        </div>

        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            aria-label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button type="submit">Subscribe</button>

          <p
            className="newsletter-message"
            data-state={newsletterState}
            aria-live="polite"
          >
            {newsletterMessage}
          </p>
        </form>
      </div>

      <div className="footer-links">
        <div className="footer-about">
          <p>
            We are a beauty brand dedicated to enhancing your natural glow
            through refined, thoughtfully curated products designed for every
            unique tone.
          </p>

          <div className="footer-social">
            {footerSocialLinks.map((social) => (
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                key={social.id}
              >
                <img src={social.src} alt={social.name} />
              </a>
            ))}
          </div>
        </div>

        {/* Sección de información de la empresa */}
        <div>
          <h4>COMPANY</h4>
          <Link to="/#hero">About Lumiere</Link>
          <Link to="/#brands">History</Link>
          <a href="mailto:teamlumiere@example.com">Work with us</a>
          <Link to="/#best-sellers">100% original</Link>
        </div>

        {/* Enlaces de ayuda y recursos */}
        <div>
          <h4>HELP</h4>
          <a href="mailto:support@lumierebeauty.example">Customer Support</a>
          <Link to="/products">Delivery Details</Link>
          <Link to="/#newsletter">Terms &amp; Conditions</Link>
          <Link to="/#newsletter">Privacy Policy</Link>
        </div>

        <div>
          <h4>ACCOUNT</h4>
          <Link to="/#newsletter">Account</Link>
          <Link to="/products">Manage Deliveries</Link>
          <Link to="/products">Orders</Link>
          <Link to="/#newsletter">Payments</Link>
        </div>

        <div>
          <h4>RESOURCES</h4>
          <Link to="/products">New Product</Link>
          <Link to="/#brands">Lumiere Creators</Link>
          <Link to="/#kits">Gifts with Purchase</Link>
          <Link to="/#newsletter">Gift Cards</Link>
        </div>
      </div>

      <div className="footer-final">
        <div className="footer-bottom">
          <Link to="/" aria-label="Home" className="footer-logo">
            <h2>Lumière</h2>
          </Link>
        </div>

        <div className="footer-payments">
          {footerPayments.map((payment) => (
            <img src={payment.src} alt={payment.name} key={payment.id} />
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;