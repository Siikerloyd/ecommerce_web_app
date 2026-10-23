import React from "react";
import "./home2.css";

const BRAND = "ZENTO";

function Icon({ size = 18, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

const ChevronLeft = (p) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

const ChevronRight = (p) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

const StarIcon = (p) => (
  <Icon {...p} fill="currentColor" strokeWidth={0}>
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.2 5.8 20.9l1.6-7L2 9.2l7.1-.6L12 2z" />
  </Icon>
);

const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

const PRODUCTS = [
  {
    name: "Studio Wireless",
    detail: "Noise-cancelling headphones",
    price: "$249",
    oldPrice: "$299",
    badge: "Bestseller",
    rating: "4.9",
  },
  {
    name: "Pulse Watch",
    detail: "Health & fitness tracker",
    price: "$179",
    oldPrice: null,
    badge: "New",
    rating: "4.8",
  },
  {
    name: "Arc Speaker",
    detail: "Portable Bluetooth sound",
    price: "$129",
    oldPrice: "$159",
    badge: null,
    rating: "4.7",
  },
  {
    name: "Lumen Lamp",
    detail: "Smart ambient lighting",
    price: "$89",
    oldPrice: null,
    badge: "Low stock",
    rating: "4.8",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Clean packaging, fast shipping, and the Studio Wireless actually deliver the sound quality they promise. Finally a store that doesn't oversell.",
    name: "Jonny Thomas",
    role: "Product designer",
    initials: "JT",
  },
  {
    quote:
      "Ordered the Pulse Watch on a Monday, it was on my wrist by Wednesday. The unboxing alone felt like a premium experience.",
    name: "Amara Chen",
    role: "Fitness coach",
    initials: "AC",
  },
  {
    quote:
      "I've bought from a dozen tech stores. ZENTO is the first one where the product photos match what actually arrives.",
    name: "Diego Ramos",
    role: "Audio engineer",
    initials: "DR",
  },
];

export function HomePage() {
  const [quote, setQuote] = React.useState(0);

  return (
    <div className="hp">
      {/* ─── NAV ─── */}
      <header className="hp-nav">
        <a href="/" className="hp-logo">
          {BRAND}
          <span className="hp-logo-dot" />
        </a>

        <nav className="hp-links" aria-label="Main">
          <a href="#home" className="is-active">
            Home
          </a>
          <a href="#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="hp-auth">
          <a href="/login" className="hp-signin">
            Sign in
          </a>
          <a href="/register" className="hp-signup">
            Sign up
            <ArrowIcon size={15} />
          </a>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="hp-hero" id="home">
        <div className="hp-hero-content">
          <p className="hp-eyebrow">
            <span className="hp-eyebrow-line" />
            Premium electronics
          </p>
          <h1 className="hp-headline">
            Tech that earns
            <br />
            its place <em>on your desk.</em>
          </h1>
          <p className="hp-sub">
            From studio-grade headphones to everyday essentials — {BRAND} curates
            electronics that last, priced without the markup theater.
          </p>

          <div className="hp-hero-actions">
            <a href="#shop" className="hp-cta">
              Shop the collection
              <ArrowIcon size={18} />
            </a>
            <a href="#about" className="hp-cta-ghost">
              Our story
            </a>
          </div>

          <div className="hp-hero-stats">
            <div>
              <strong>120+</strong>
              <span>Curated products</span>
            </div>
            <div>
              <strong>38k</strong>
              <span>Happy customers</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>
          </div>
        </div>

        {/* Decorative product area — replace with real image later */}
        <div className="hp-hero-visual" aria-hidden="true">
          <div className="hp-hero-card hp-hero-card--price">
            <span>Studio Wireless</span>
            <strong>$249</strong>
          </div>
          <div className="hp-hero-card hp-hero-card--rating">
            <StarIcon size={14} />
            <strong>4.9</strong>
            <span>2,140 reviews</span>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE STRIP ─── */}
      <div className="hp-marquee" aria-hidden="true">
        <div className="hp-marquee-track">
          {Array.from({ length: 2 }).map((_, i) => (
            <div className="hp-marquee-group" key={i}>
              {[
                "Free shipping over $75",
                "2-year warranty",
                "30-day returns",
                "24/7 human support",
                "Carbon-neutral delivery",
                "Price-match promise",
              ].map((t) => (
                <span key={t}>
                  <StarIcon size={11} />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── DISCOVER / PRODUCTS ─── */}
      <section className="hp-discover" id="shop">
        <div className="hp-section-head">
          <p className="hp-section-eyebrow">The collection</p>
          <h2>Discover the best gear</h2>
          <p>
            Curated tech that actually lasts. No fluff — just the products we
            stand behind.
          </p>
        </div>

        <div className="hp-category-row">
          {["All", "Audio", "Wearables", "Smart home", "Accessories"].map((c, i) => (
            <button key={c} type="button" className={i === 0 ? "is-active" : ""}>
              {c}
            </button>
          ))}
        </div>

        <div className="hp-products">
          {PRODUCTS.map((p) => (
            <article key={p.name} className="hp-card">
              <div className="hp-card-img" aria-hidden="true">
                {p.badge && <span className="hp-card-badge">{p.badge}</span>}
                <button type="button" className="hp-card-quick">
                  Add to cart
                </button>
              </div>
              <div className="hp-card-body">
                <div className="hp-card-rating">
                  <StarIcon size={13} />
                  <span>{p.rating}</span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.detail}</p>
                <div className="hp-card-foot">
                  <div className="hp-card-price">
                    <span>{p.price}</span>
                    {p.oldPrice && <s>{p.oldPrice}</s>}
                  </div>
                  <a href="#" className="hp-card-view">
                    View
                    <ArrowIcon size={14} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── PROMO BANNER ─── */}
      <section className="hp-promo" id="about">
        <div className="hp-promo-text">
          <p className="hp-section-eyebrow hp-section-eyebrow--light">
            Members only
          </p>
          <h2>
            Get a chance to
            <br />
            <em>own the best</em>
          </h2>
          <p>
            Limited drops, early access, and exclusive bundles — only for members
            of {BRAND}.
          </p>
          <ul className="hp-promo-list">
            <li>
              <CheckIcon size={16} />
              Early access to limited drops
            </li>
            <li>
              <CheckIcon size={16} />
              Members-only pricing
            </li>
            <li>
              <CheckIcon size={16} />
              Free returns, always
            </li>
          </ul>
          <a href="/register" className="hp-cta hp-cta-light">
            Join now
            <ArrowIcon size={18} />
          </a>
        </div>
        <div className="hp-promo-visual" aria-hidden="true">
          <div className="hp-promo-tag">
            <span>Member drop</span>
            <strong>-25%</strong>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="hp-feedback">
        <div className="hp-section-head">
          <p className="hp-section-eyebrow">Word of mouth</p>
          <h2>What people are saying</h2>
          <p>Real feedback from people who shop with us.</p>
        </div>

        <div className="hp-quote-wrap">
          <button
            type="button"
            className="hp-quote-nav"
            aria-label="Previous"
            onClick={() => setQuote((q) => (q - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
          >
            <ChevronLeft size={18} />
          </button>

          <blockquote className="hp-quote">
            <span className="hp-quote-mark">“</span>
            <p>{TESTIMONIALS[quote].quote}</p>
            <footer>
              <span className="hp-quote-avatar">
                {TESTIMONIALS[quote].initials}
              </span>
              <div>
                <strong>{TESTIMONIALS[quote].name}</strong>
                <span>{TESTIMONIALS[quote].role}</span>
              </div>
            </footer>
          </blockquote>

          <button
            type="button"
            className="hp-quote-nav"
            aria-label="Next"
            onClick={() => setQuote((q) => (q + 1) % TESTIMONIALS.length)}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="hp-quote-dots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              className={i === quote ? "is-active" : ""}
              onClick={() => setQuote(i)}
            />
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="hp-news">
        <div className="hp-news-inner">
          <p className="hp-section-eyebrow hp-section-eyebrow--light">
            The ZENTO dispatch
          </p>
          <h2>Stay in the loop</h2>
          <p>
            New drops, exclusive deals, and the occasional tech tip — no spam.
          </p>
          <form className="hp-news-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
            />
            <button type="submit">
              Subscribe
              <ArrowIcon size={15} />
            </button>
          </form>
          <small>One email a week. Unsubscribe anytime.</small>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hp-footer" id="contact">
        <div className="hp-footer-grid">
          <div className="hp-footer-brand">
            <p className="hp-logo hp-logo--footer">
              {BRAND}
              <span className="hp-logo-dot" />
            </p>
            <p>
              Premium electronics, thoughtfully chosen. Built for people who
              care about what they buy.
            </p>
            <div className="hp-social">
              <a href="#" aria-label="Twitter">
                𝕏
              </a>
              <a href="#" aria-label="Instagram">
                IG
              </a>
              <a href="#" aria-label="YouTube">
                YT
              </a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <a href="#">Headphones</a>
            <a href="#">Wearables</a>
            <a href="#">Audio</a>
            <a href="#">Lighting</a>
          </div>

          <div>
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Sustainability</a>
          </div>

          <div>
            <h4>Support</h4>
            <a href="#">Help center</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#contact">Contact</a>
          </div>
        </div>

        <div className="hp-footer-bottom">
          <p>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <div className="hp-footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}