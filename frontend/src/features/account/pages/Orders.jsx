import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import CartButton from "../../cart/components/CartButton";
import "./orders.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const ORDER_STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_CLASSES = {
  PENDING: "zos-status--pending",
  CONFIRMED: "zos-status--confirmed",
  PREPARING: "zos-status--preparing",
  SHIPPED: "zos-status--shipped",
  OUT_FOR_DELIVERY: "zos-status--out-for-delivery",
  DELIVERED: "zos-status--delivered",
  CANCELLED: "zos-status--cancelled",
};

const PAYMENT_METHOD_LABELS = {
  CASH_ON_DELIVERY: "Cash on delivery",
  CREDIT_CARD: "Credit card",
  PAYPAL: "PayPal",
};

const PAYMENT_STATUS_LABELS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

function formatPrice(value) {
  const price = Number(value);
  if (!Number.isFinite(price)) return "Price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function getUserFacingError(error, fallback) {
  if (error instanceof TypeError) {
    return "Could not connect to the server. Check your connection and try again.";
  }
  return error instanceof Error ? error.message : fallback;
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

function OrderCard({
  order,
  onViewDetails,
}) {
  const status = order.status ?? "PENDING";
  const statusLabel = ORDER_STATUS_LABELS[status] ?? status;
  const statusClass = ORDER_STATUS_CLASSES[status] ?? "";
  const itemCount = Array.isArray(order.items) ? order.items.length : 0;
  const paymentMethod = order.payment_method
    ? PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method
    : "—";
  const paymentStatus = order.payment_status
    ? PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status
    : "—";

  return (
    <article className="zos-card">
      <div className="zos-card-header">
        <div className="zos-card-id">
          <span className="zos-order-number">Order {order.order_number ?? `#${order.order_id}`}</span>
          <span className={"zos-status-badge " + statusClass}>{statusLabel}</span>
        </div>
        <p className="zos-card-date">{formatOrderDate(order.created_at)}</p>
      </div>

      <div className="zos-card-details">
        <dl className="zos-detail-grid">
          <div>
            <dt>Total</dt>
            <dd className="zos-total">{formatPrice(order.total_price)}</dd>
          </div>
          <div>
            <dt>Items</dt>
            <dd>{itemCount} {itemCount === 1 ? "item" : "items"}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{paymentMethod}</dd>
          </div>
          <div>
            <dt>Payment status</dt>
            <dd className="zos-payment-status">{paymentStatus}</dd>
          </div>
        </dl>
      </div>

      <div className="zos-card-actions">
        <button
          type="button"
          className="zos-view-button"
          onClick={() => onViewDetails(order.order_id)}
        >
          View details <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

function OrderSkeleton() {
  return (
    <article className="zos-card zos-skeleton">
      <div className="zos-card-header">
        <div className="zos-skeleton-line zos-skeleton-line--short" />
        <div className="zos-skeleton-line zos-skeleton-line--short" />
      </div>
      <div className="zos-card-details">
        <div className="zos-skeleton-grid">
          <div className="zos-skeleton-line" />
          <div className="zos-skeleton-line" />
          <div className="zos-skeleton-line" />
          <div className="zos-skeleton-line" />
        </div>
      </div>
      <div className="zos-card-actions">
        <div className="zos-skeleton-line zos-skeleton-line--button" />
      </div>
    </article>
  );
}

export default function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function fetchOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
          credentials: "include",
        });
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("The orders response was not valid JSON.");
        }

        if (!response.ok) {
          throw new Error(data.message || `Could not load orders (${response.status}).`);
        }
        if (!Array.isArray(data.result)) {
          throw new Error("The orders response was not in the expected format.");
        }
        if (isActive) {
          setOrders(data.result);
          setError("");
        }
      } catch (err) {
        console.error("Could not load orders:", err);
        if (isActive) {
          setError(
            getUserFacingError(err, "Could not load your orders. Please try again."),
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    fetchOrders();
    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  function handleRetry() {
    setIsLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }

  function handleViewDetails(orderId) {
    navigate(`/account/orders/${orderId}`);
  }

  const accountName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Account holder"
    : "Account holder";

  return (
    <div className="zos-page">
      <div className="zos-announcement">
        <span>Your order history, all in one place</span>
        <i aria-hidden="true" />
        <span>Orders update automatically as they progress</span>
      </div>

      <header className="zos-header">
        <Link className="zos-wordmark" to="/shop" aria-label="ZENTO, back to shop">
          ZENTO<span>.</span>
        </Link>
        <nav className="zos-header-nav" aria-label="Main navigation">
          <Link to="/shop">Collection</Link>
          <Link to="/cart">Your bag</Link>
          <Link to="/account">Account</Link>
        </nav>
        <CartButton className="zos-cart-trigger" />
      </header>

      <main className="zos-main">
        <div className="zos-breadcrumbs">
          <Link to="/account">Account</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Orders</span>
        </div>

        <section className="zos-intro" aria-labelledby="zos-page-title">
          <div className="zos-intro-copy">
            <p className="zos-eyebrow">Your account / 02 " Order history</p>
            <h1 id="zos-page-title">My <em>Orders.</em></h1>
            <p>
              Track every purchase from placement to delivery. Your complete
              order history, all in one view.
            </p>
          </div>
          <div className="zos-intro-count" aria-label={orders.length + " orders"}>
            <span className="zos-count-orbit" aria-hidden="true"><BoxIcon /></span>
            <strong>{String(orders.length).padStart(2, "0")}</strong>
            <span>{orders.length === 1 ? "order" : "orders"}</span>
          </div>
          <div className="zos-intro-caption">
            <span>ORDER HISTORY / {String(orders.length).padStart(2, "0")}</span>
            <span>For {accountName}</span>
          </div>
        </section>

        <div className="zos-dashboard">
          <aside className="zos-sidebar" aria-label="Account navigation">
            <p className="zos-sidebar-label">Your account</p>
            <nav className="zos-side-nav">
              <Link to="/account"><span>01</span> Profile</Link>
              <Link
                className="is-active"
                to="/account/orders"
                aria-current="page"
              >
                <span>02</span> Orders
              </Link>
              <Link to="/account/addresses"><span>03</span> Addresses</Link>
              <Link to="/cart"><span>04</span> Shopping bag</Link>
            </nav>
            <div className="zos-sidebar-note">
              <span className="zos-note-dot" aria-hidden="true" />
              <p>
                <strong>Only your orders.</strong>
                <span>Order history shown here belongs to your signed-in account.</span>
              </p>
            </div>
            <Link className="zos-back-account" to="/account">
              Back to account <ArrowIcon />
            </Link>
          </aside>

          <div className="zos-content">
            <div className="zos-section-heading">
              <div>
                <p className="zos-eyebrow">Order history</p>
                <h2>Your recent orders.</h2>
              </div>
            </div>

            {error && (
              <div className="zos-error-state" role="alert">
                <p>{error}</p>
                <button type="button" onClick={handleRetry} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Try again"}
                </button>
              </div>
            )}

            {isLoading && !error ? (
              <div className="zos-skeleton-list" role="status" aria-label="Loading orders">
                <OrderSkeleton />
                <OrderSkeleton />
                <OrderSkeleton />
              </div>
            ) : orders.length === 0 ? (
              <div className="zos-empty-state" role="status">
                <span className="zos-empty-mark" aria-hidden="true"><BoxIcon /></span>
                <p className="zos-eyebrow">Room for something new</p>
                <h2>No orders yet.</h2>
                <p>Your order history will appear here once you place your first order.</p>
                <Link className="zos-primary-button" to="/shop">
                  Start shopping <ArrowIcon />
                </Link>
              </div>
            ) : (
              <div className="zos-order-grid">
                {orders.map((order) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            <div className="zos-schema-note">
              <span className="zos-schema-mark" aria-hidden="true">Z.</span>
              <p>
                Orders include the order number, date, status, item count, total,
                payment method, and payment status. Status progresses from
                Pending through Confirmed, Preparing, Shipped, Out for delivery,
                to Delivered. Cancelled orders show the cancellation status.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="zos-footer">
        <Link className="zos-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>LESS, BUT BETTER.</span>
        <Link to="/account">Back to your account <ArrowIcon /></Link>
      </footer>
    </div>
  );
}
