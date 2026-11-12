import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./cart.css";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

export default function MiniCartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    isAuthenticated,
    isCartLoading,
    cartError,
    cartWarning,
    retryCartSync,
    updateQuantity,
    removeItem,
    closeCart,
  } = useCart();
  const closeButton = useRef(null);
  const drawer = useRef(null);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        closeCart();
        return;
      }

      if (event.key === "Tab") {
        const focusable = drawer.current?.querySelectorAll('a[href], button:not([disabled])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div
      className="zcart-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
    >
      <button className="zcart-backdrop" type="button" aria-label="Close shopping cart" onClick={closeCart} />
      <aside
        ref={drawer}
        className="zcart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="zcart-title"
      >
        <header className="zcart-drawer-header">
          <div>
            <p className="zcart-eyebrow">Your selection</p>
            <h2 id="zcart-title">Shopping bag <span>{itemCount}</span></h2>
          </div>
          <button ref={closeButton} className="zcart-close" type="button" aria-label="Close shopping cart" onClick={closeCart}>
            <CloseIcon />
          </button>
        </header>

        {cartError && (
          <p className="zcart-message is-error" role="alert">
            {cartError} <button type="button" onClick={retryCartSync}>Retry sync</button>
          </p>
        )}
        {!isAuthenticated && !isCartLoading && (
          <p
            className={`zcart-message${cartWarning ? " is-warning" : ""}`}
            role={cartWarning ? "alert" : undefined}
          >
            {cartWarning || "Your bag is saved on this device."}{" "}
            <Link to="/login" onClick={closeCart}>Sign in</Link> to save it to your account.
          </p>
        )}
        {isCartLoading && <p className="zcart-message" role="status">Loading your saved cart...</p>}

        {items.length === 0 ? (
          <div className="zcart-empty">
            <span className="zcart-empty-mark">Z.</span>
            <h3>Your bag is taking a breather.</h3>
            <p>Find something worth bringing home.</p>
            <Link className="zcart-button zcart-button-outline" to="/shop" onClick={closeCart}>Continue shopping</Link>
          </div>
        ) : (
          <>
            <div className="zcart-items">
              {items.map((item) => (
                <article className="zcart-item" key={item.product_id}>
                  <Link className="zcart-item-image" to={`/products/${item.product_id}`} onClick={closeCart}>
                    {item.image ? <img src={item.image} alt="" /> : <span>ZENTO</span>}
                  </Link>
                  <div className="zcart-item-copy">
                    <div className="zcart-item-heading">
                      <div>
                        {item.brand && <p>{item.brand}</p>}
                        <Link to={`/products/${item.product_id}`} onClick={closeCart}>{item.name}</Link>
                      </div>
                      <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.product_id)}>Remove</button>
                    </div>
                    <div className="zcart-item-bottom">
                      <div className="zcart-stepper" aria-label={`${item.name} quantity`}>
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <output>{item.quantity}</output>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          disabled={item.quantity >= item.stock_quantity}
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <footer className="zcart-drawer-footer">
              <div className="zcart-subtotal"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p>Shipping and any applicable charges are calculated later.</p>
              <Link className="zcart-button zcart-button-primary" to="/cart" onClick={closeCart}>View cart <span>→</span></Link>
              <button className="zcart-continue" type="button" onClick={closeCart}>Continue shopping</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
