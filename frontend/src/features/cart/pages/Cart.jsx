import { useState } from "react";
import { Link } from "react-router-dom";
import CartButton from "../components/CartButton";
import { useCart } from "../hooks/useCart";
import "../components/cart.css";

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CartItem({ item, updateQuantity, removeItem }) {
  return (
    <article className="zcp-item">
      <Link className="zcp-item-image" to={`/products/${item.product_id}`}>
        {item.image ? <img src={item.image} alt="" /> : <span>ZENTO</span>}
      </Link>
      <div className="zcp-item-info">
        <div className="zcp-item-name">
          <div>
            {item.brand && <p>{item.brand}</p>}
            <Link to={`/products/${item.product_id}`}>{item.name}</Link>
            {item.sku && <span className="zcp-sku">Ref. {item.sku}</span>}
          </div>
          <button
            className="zcp-remove"
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() => removeItem(item.product_id)}
          >
            Remove
          </button>
        </div>
        <div className="zcp-item-controls">
          <div>
            <span className="zcp-unit-price">{formatPrice(item.price)} / unit</span>
            <div className="zcp-stepper" aria-label={`${item.name} quantity`}>
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
          </div>
          <strong className="zcp-line-total">{formatPrice(item.price * item.quantity)}</strong>
        </div>
      </div>
    </article>
  );
}

export default function Cart() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    isAuthenticated,
    isCartLoading,
    cartError,
    retryCartSync,
  } = useCart();
  const [checkoutNotice, setCheckoutNotice] = useState("");

  const clearItems = () => {
    if (window.confirm("Clear all items from your shopping cart?")) clearCart();
  };

  return (
    <div className="zcp-page">
      <div className="zcp-topline">
        <span>ZENTO / OBJECTS FOR THE EVERYDAY</span>
        <span>YOUR SELECTION / {String(itemCount).padStart(2, "0")}</span>
      </div>
      <header className="zcp-header">
        <Link className="zcp-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <nav aria-label="Main navigation"><Link to="/shop">Shop</Link><span>Shopping cart</span></nav>
        <CartButton className="zcp-cart-trigger" />
      </header>

      <main className="zcp-main">
        <div className="zcp-breadcrumbs">
          <Link to="/shop">Shop</Link><span>/</span><span aria-current="page">Shopping cart</span>
        </div>
        <div className="zcp-title-row">
          <div>
            <p className="zcp-eyebrow">The considered edit / Your bag</p>
            <h1>Shopping <em>Cart.</em></h1>
          </div>
          <p>{itemCount} {itemCount === 1 ? "piece" : "pieces"} selected</p>
        </div>

        {cartError && (
          <p className="zcp-cart-message is-error" role="alert">
            {cartError} <button type="button" onClick={retryCartSync}>Retry sync</button>
          </p>
        )}
        {!isAuthenticated && !isCartLoading && (
          <p className="zcp-cart-message">
            Your bag is saved on this device. <Link to="/login">Sign in</Link> to sync it with your account.
          </p>
        )}
        {isCartLoading && <p className="zcp-cart-message" role="status">Loading your saved cart...</p>}

        {items.length === 0 ? (
          <section className="zcp-empty">
            <span className="zcp-empty-mark">Z.</span>
            <div>
              <p className="zcp-eyebrow">Nothing here, for now</p>
              <h2>Your bag is ready for a good find.</h2>
              <p>Take a look through the collection and add something that fits your everyday.</p>
              <Link className="zcp-button zcp-button-primary" to="/shop">Continue shopping <ArrowIcon /></Link>
            </div>
          </section>
        ) : (
          <div className="zcp-layout">
            <section className="zcp-list" aria-label="Cart items">
              <div className="zcp-list-heading">
                <span>Your selection <b>{items.length}</b></span>
                <button type="button" onClick={clearItems}>Clear cart</button>
              </div>
              <div className="zcp-items">
                {items.map((item) => (
                  <CartItem
                    key={item.product_id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>
              <Link className="zcp-continue-link" to="/shop">← Continue shopping</Link>
            </section>

            <aside className="zcp-summary" aria-labelledby="zcp-summary-title">
              <p className="zcp-eyebrow">A clear view</p>
              <h2 id="zcp-summary-title">Order summary</h2>
              <div className="zcp-summary-line"><span>Subtotal · {itemCount} {itemCount === 1 ? "piece" : "pieces"}</span><strong>{formatPrice(subtotal)}</strong></div>
              <div className="zcp-summary-line"><span>Shipping</span><span className="zcp-later">Calculated later</span></div>
              <div className="zcp-summary-total"><span>Total before shipping</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="zcp-summary-note">Shipping and applicable charges will be confirmed when checkout is available.</p>
              {/* TODO(wire): Navigate to checkout when the route and order flow exist. */}
              <button
                className="zcp-button zcp-button-primary zcp-checkout"
                type="button"
                onClick={() => setCheckoutNotice("Checkout is not connected yet. No order has been placed.")}
              >
                Continue to checkout <ArrowIcon />
              </button>
              {checkoutNotice && <p className="zcp-checkout-notice" role="status">{checkoutNotice}</p>}
              <div className="zcp-summary-mark"><span>01</span> Thoughtfully chosen. Yours to keep.</div>
            </aside>
          </div>
        )}
      </main>

      <footer className="zcp-footer">
        <Link className="zcp-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>LESS, BUT BETTER.</span>
        <Link to="/shop">Back to the collection <ArrowIcon /></Link>
      </footer>
    </div>
  );
}
