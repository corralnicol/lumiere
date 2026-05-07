import { useState, type FormEvent } from "react";
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

        <div>
          <h4>COMPANY</h4>
          <a href="#hero">About Lumiere</a>
          <a href="#brands">History</a>
          <a href="mailto:teamlumiere@example.com">Work with us</a>
          <a href="#best-sellers">100% original</a>
        </div>

        <div>
          <h4>HELP</h4>
          <a href="mailto:support@lumierebeauty.example">Customer Support</a>
          <a href="/products">Delivery Details</a>
          <a href="#newsletter">Terms &amp; Conditions</a>
          <a href="#newsletter">Privacy Policy</a>
        </div>

        <div>
          <h4>ACCOUNT</h4>
          <a href="#newsletter">Account</a>
          <a href="/products">Manage Deliveries</a>
          <a href="/products">Orders</a>
          <a href="#newsletter">Payments</a>
        </div>

        <div>
          <h4>RESOURCES</h4>
          <a href="/products">New Product</a>
          <a href="#brands">Lumiere Creators</a>
          <a href="#kits">Gifts with Purchase</a>
          <a href="#newsletter">Gift Cards</a>
        </div>
      </div>

      <div className="footer-final">
        <div className="footer-bottom">
          <h2>Lumière</h2>
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