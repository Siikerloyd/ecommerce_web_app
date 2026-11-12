import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import CartButton from "../../cart/components/CartButton";
import "./account.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const PROFILE_FIELDS = [
  { name: "first_name", label: "First name", autoComplete: "given-name" },
  { name: "last_name", label: "Last name", autoComplete: "family-name" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "phone_number", label: "Phone number", type: "tel", autoComplete: "tel" },
];

function getRoleLabel(role) {
  const roleLabels = {
    CUSTOMER: "Customer",
    ADMIN: "Administrator",
    DELIVERY: "Delivery partner",
  };
  return roleLabels[role] ?? role;
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "Z";
}

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

export default function Account() {
  const { logout, user, setUser } = useContext(AuthContext);
  const profile = user ?? {};
  const navigate = useNavigate();
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("status");
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [ordersReload, setOrdersReload] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [addressesReload, setAddressesReload] = useState(0);

  function startEditing() {
    setDraft(profile);
    setErrors({});
    setNotice("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(profile);
    setErrors({});
    setNotice("");
    setIsEditing(false);
  }

  function updateDraft(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateDraft() {
    const nextErrors = {};
    const firstName = String(draft.first_name ?? "").trim();
    const lastName = String(draft.last_name ?? "").trim();
    const email = String(draft.email ?? "").trim();
    const phone = String(draft.phone_number ?? "").trim();
    const normalizedPhone = phone.replace(/[\s()+-]/g, "");

    if (firstName.length < 2 || firstName.length > 50) {
      nextErrors.first_name = "Use between 2 and 50 characters.";
    }
    if (lastName.length < 2 || lastName.length > 50) {
      nextErrors.last_name = "Use between 2 and 50 characters.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 100) {
      nextErrors.email = "Enter a valid email address (up to 100 characters).";
    }
    if (!/^[0-9\s()+-]+$/.test(phone) || normalizedPhone.length < 8 || normalizedPhone.length > 20) {
      nextErrors.phone_number = "Enter a phone number containing 8 to 20 digits.";
    }

    return nextErrors;
  }

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
          setOrdersError("");
        }
      } catch (error) {
        console.error("Could not load orders:", error);
        if (isActive) {
          setOrdersError(
            getUserFacingError(error, "Could not load your orders. Please try again."),
          );
        }
      } finally {
        if (isActive) setIsOrdersLoading(false);
      }
    }

    fetchOrders();
    return () => {
      isActive = false;
    };
  }, [ordersReload]);

  useEffect(() => {
    let isActive = true;

    async function fetchAddresses() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/addresses`, {
          credentials: "include",
        });
        let data;
        try {
          data = await response.json();
        } catch {
          throw new Error("The addresses response was not valid JSON.");
        }

        if (!response.ok) {
          throw new Error(data.message || `Could not load addresses (${response.status}).`);
        }
        if (!Array.isArray(data.result)) {
          throw new Error("The addresses response was not in the expected format.");
        }
        if (isActive) {
          setAddresses(data.result);
          setAddressesError("");
        }
      } catch (error) {
        console.error("Could not load addresses:", error);
        if (isActive) {
          setAddressesError(
            getUserFacingError(error, "Could not load your addresses. Please try again."),
          );
        }
      } finally {
        if (isActive) setIsAddressesLoading(false);
      }
    }

    fetchAddresses();
    return () => {
      isActive = false;
    };
  }, [addressesReload]);
  async function saveProfile(event) {
    event.preventDefault();

    if (!user?.user_id) {
      setNoticeType("error");
      setNotice("Your account is not available. Please sign in again.");
      return;
    }

    const nextErrors = validateDraft();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      first_name: String(draft.first_name ?? "").trim(),
      last_name: String(draft.last_name ?? "").trim(),
      email: String(draft.email ?? "").trim(),
      phone_number: String(draft.phone_number ?? "").trim(),
    };

    setIsSaving(true);
    setNotice("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${user.user_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.message || `Could not update profile (${response.status}).`);
      }

      setUser((currentUser) =>
        currentUser ? { ...currentUser, ...payload } : currentUser,
      );
      setDraft((currentDraft) => ({ ...currentDraft, ...payload }));
      setIsEditing(false);
      setNoticeType("status");
      setNotice("Your account details have been updated.");
    } catch (error) {
      console.error("Could not update account profile:", error);
      setNoticeType("error");
      setNotice(getUserFacingError(error, "Could not update your account details. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  async function signOut() {
    setIsSigningOut(true);
    setNotice("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Could not sign out:", error);
      setNoticeType("error");
      const message = error instanceof Error ? error.message : "";
      setNotice(
        message === "Logout failed"
          ? "Could not sign out. Please try again."
          : getUserFacingError(error, "Could not sign out. Please try again."),
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="za-page">
      <div className="za-announcement">
        <span>Your space, thoughtfully arranged</span>
        <i aria-hidden="true" />
        <span>Account profile · your details stay up to date</span>
      </div>

      <header className="za-header">
        <Link className="za-wordmark" to="/shop" aria-label="ZENTO, back to shop">
          ZENTO<span>.</span>
        </Link>
        <nav className="za-header-nav" aria-label="Main navigation">
          <Link to="/shop">Collection</Link>
          <Link to="/cart">Your bag</Link>
          <span aria-current="page">Account</span>
        </nav>
        <CartButton className="za-cart-trigger" />
      </header>

      <main className="za-main">
        <div className="za-breadcrumbs">
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Account</span>
        </div>

        <section className="za-welcome" aria-labelledby="za-welcome-title">
          <div className="za-welcome-copy">
            <p className="za-eyebrow">Your ZENTO account</p>
            <h1 id="za-welcome-title">
              Welcome back, <em>{profile.first_name || "there"}.</em>
            </h1>
            <p>
              A quieter place to keep your details close and find your way around.
            </p>
          </div>
          <div className="za-welcome-mark" aria-hidden="true">
            <span>{getInitials(user?.first_name, user?.last_name)}</span>
            <i />
          </div>
          <div className="za-welcome-caption">
            <span>01 / PERSONAL SPACE</span>
            <span>{getRoleLabel(user?.role) || "Account"}</span>
          </div>
        </section>

        <div className="za-dashboard">
          <aside className="za-sidebar" aria-label="Account navigation">
            <p className="za-eyebrow">Your account</p>
            <nav className="za-side-nav">
              <a className="is-active" href="#profile" aria-current="page">
                <span>01</span> Profile
              </a>
              <a href="#orders"><span>02</span> Orders</a>
              <a href="#addresses"><span>03</span> Addresses</a>
              <Link to="/cart"><span>04</span> Shopping bag</Link>
            </nav>
            <div className="za-sidebar-note">
              <span className="za-note-dot" />
              <p>
                <strong>Your details stay yours.</strong>
                <span>Keep your personal details current.</span>
              </p>
            </div>
            <button
              className="za-signout"
              type="button"
              onClick={signOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out…" : "Sign out"}
              <ArrowIcon />
            </button>
          </aside>

          <div className="za-content">
            <section className="za-profile-card" id="profile" aria-labelledby="za-profile-title">
              <div className="za-section-heading">
                <div>
                  <p className="za-eyebrow">01 / Personal information</p>
                  <h2 id="za-profile-title">The details behind your account.</h2>
                </div>
                {!isEditing && (
                  <button
                    className="za-outline-button"
                    type="button"
                    onClick={startEditing}
                    disabled={!user || isSaving}
                  >
                    Edit details
                  </button>
                )}
              </div>

              {notice && (
                <p
                  className={`za-notice${noticeType === "error" ? " is-error" : ""}`}
                  role={noticeType === "error" ? "alert" : "status"}
                >
                  {notice}
                </p>
              )}

              {isEditing ? (
                <form className="za-profile-form" onSubmit={saveProfile} noValidate>
                  {PROFILE_FIELDS.map((field) => (
                    <label className="za-field" key={field.name}>
                      <span>{field.label}</span>
                      <input
                        name={field.name}
                        type={field.type ?? "text"}
                        autoComplete={field.autoComplete}
                        value={draft[field.name]}
                        onChange={updateDraft}
                        disabled={isSaving}
                        maxLength={field.name === "email" ? 100 : field.name === "phone_number" ? 20 : 50}
                        aria-invalid={Boolean(errors[field.name])}
                        aria-describedby={errors[field.name] ? `za-error-${field.name}` : undefined}
                      />
                      {errors[field.name] && (
                        <small id={`za-error-${field.name}`}>{errors[field.name]}</small>
                      )}
                    </label>
                  ))}
                  <div className="za-form-actions">
                    <button className="za-primary-button" type="submit" disabled={isSaving}>
                      {isSaving ? "Saving…" : "Save changes"} <ArrowIcon />
                    </button>
                    <button
                      className="za-cancel-button"
                      type="button"
                      onClick={cancelEditing}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="za-form-hint">
                    Your changes are saved to your account when you select “Save changes.”
                  </p>
                </form>
              ) : (
                <dl className="za-profile-details">
                  <div>
                    <dt>First name</dt>
                    <dd>{profile.first_name || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Last name</dt>
                    <dd>{profile.last_name || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Email address</dt>
                    <dd>{profile.email || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Phone number</dt>
                    <dd>{profile.phone_number || "Not provided"}</dd>
                  </div>
                </dl>
              )}

              <div className="za-account-meta">
                <span className="za-meta-mark" aria-hidden="true">Z.</span>
                <div>
                  <p className="za-eyebrow">Account type</p>
                  <strong>{getRoleLabel(user?.role) || "Account"}</strong>
                </div>
                <small>Role from your signed-in account</small>
              </div>
            </section>

            <div className="za-shortcuts" aria-label="Account sections">
              <a className="za-shortcut" href="#orders">
                <span className="za-shortcut-index">02 / HISTORY</span>
                <strong>Orders</strong>
                <span className="za-shortcut-copy">Order history and status</span>
                <ArrowIcon />
              </a>
              <a className="za-shortcut" href="#addresses">
                <span className="za-shortcut-index">03 / DELIVERY</span>
                <strong>Addresses</strong>
                <span className="za-shortcut-copy">Saved delivery destinations</span>
                <ArrowIcon />
              </a>
            </div>

            <div className="za-account-data-sections">
              <section className="za-account-data-card" id="orders" aria-labelledby="za-orders-title">
                <p className="za-eyebrow">02 / Order history</p>
                <h2 id="za-orders-title">Your recent orders.</h2>
                {isOrdersLoading ? (
                  <p className="za-data-message" role="status">Loading your orders…</p>
                ) : ordersError ? (
                  <div className="za-data-error">
                    <p role="alert">{ordersError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOrdersLoading(true);
                        setOrdersError("");
                        setOrdersReload((current) => current + 1);
                      }}
                      disabled={isOrdersLoading}
                    >
                      {isOrdersLoading ? "Loading…" : "Try again"}
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <p className="za-data-message">You have no orders yet.</p>
                ) : (
                  <ul className="za-data-list">
                    {orders.map((order) => (
                      <li className="za-data-item" key={order.order_id}>
                        <div className="za-data-item-heading">
                          <strong>Order {order.order_number || `#${order.order_id}`}</strong>
                          <span>{order.status?.replaceAll("_", " ") || "Status unavailable"}</span>
                        </div>
                        <p>{formatOrderDate(order.created_at)}</p>
                        <strong>{formatPrice(order.total_price)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <section className="za-account-data-card" id="addresses" aria-labelledby="za-addresses-title">
                <p className="za-eyebrow">03 / Saved destinations</p>
                <h2 id="za-addresses-title">Your saved addresses.</h2>
                {isAddressesLoading ? (
                  <p className="za-data-message" role="status">Loading your addresses…</p>
                ) : addressesError ? (
                  <div className="za-data-error">
                    <p role="alert">{addressesError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressesLoading(true);
                        setAddressesError("");
                        setAddressesReload((current) => current + 1);
                      }}
                      disabled={isAddressesLoading}
                    >
                      {isAddressesLoading ? "Loading…" : "Try again"}
                    </button>
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="za-data-message">You have no saved addresses.</p>
                ) : (
                  <ul className="za-data-list">
                    {addresses.map((address) => (
                      <li className="za-data-item" key={address.address_id}>
                        <div className="za-data-item-heading">
                          <strong>{address.title || "Address"}</strong>
                          {address.is_default && <span>Default</span>}
                        </div>
                        <p>
                          {address.street}<br />
                          {address.city}, {address.postal_code}<br />
                          {address.country}
                        </p>
                        <small>{address.phone_number}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="za-collection-prompt">
              <div>
                <p className="za-eyebrow">A considered edit</p>
                <h2>Something good, waiting to be found.</h2>
              </div>
              <Link className="za-text-link" to="/shop">
                Explore the collection <ArrowIcon />
              </Link>
            </section>
          </div>
        </div>
      </main>

      <footer className="za-footer">
        <Link className="za-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>LESS, BUT BETTER.</span>
        <Link to="/shop">Back to the collection <ArrowIcon /></Link>
      </footer>
    </div>
  );
}
