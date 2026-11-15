import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../auth/context/AuthContext";
import CartButton from "../../cart/components/CartButton";
import "./addresses.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const EMPTY_ADDRESS = {
  title: "",
  street: "",
  city: "",
  postal_code: "",
  country: "",
  phone_number: "",
  is_default: false,
};

const REQUIRED_ADDRESS_FIELDS = [
  ["title", 50],
  ["street", 150],
  ["city", 50],
  ["postal_code", 20],
  ["country", 50],
];

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

function PinIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function validateAddress(values) {
  const errors = {};

  REQUIRED_ADDRESS_FIELDS.forEach(([field, maxLength]) => {
    const value = values[field].trim();
    if (!value) errors[field] = "This field is required.";
    else if (value.length > maxLength) {
      errors[field] = `Use ${maxLength} characters or fewer.`;
    }
  });

  const phone = values.phone_number.trim();
  const normalizedPhone = phone.replace(/[\s()+-]/g, "");
  if (!phone) errors.phone_number = "A phone number is required.";
  else if (!/^[0-9\s()+-]+$/.test(phone)) {
    errors.phone_number = "Use digits, spaces, +, parentheses, or hyphens.";
  } else if (normalizedPhone.length < 8 || normalizedPhone.length > 20) {
    errors.phone_number = "Enter between 8 and 20 digits.";
  }

  return errors;
}

function getAccountName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Account holder";
}

function AddressCard({
  address,
  accountName,
  email,
  isConfirmingDelete,
  onEdit,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
  onSetDefault,
}) {
  return (
    <article className={`zab-card${address.is_default ? " is-default" : ""}`}>
      <div className="zab-card-topline">
        <span className="zab-card-index">
          {String(address.address_id).padStart(2, "0")}
        </span>
        {address.is_default ? (
          <span className="zab-default-badge">
            <span aria-hidden="true">?</span> Default address
          </span>
        ) : (
          <span className="zab-secondary-label">Saved destination</span>
        )}
      </div>

      <div className="zab-card-heading">
        <div>
          <p className="zab-card-kicker">Address book / {address.title}</p>
          <h2>{address.title}</h2>
        </div>
        <span className="zab-pin-mark" aria-hidden="true"><PinIcon /></span>
      </div>

      <div className="zab-card-rule" />

      <div className="zab-address-details">
        <p className="zab-detail-label">Recipient</p>
        <p className="zab-recipient">{accountName}</p>
        {email && <p className="zab-account-email">{email}</p>}

        <p className="zab-detail-label zab-detail-label--address">Delivery address</p>
        <address>
          <span>{address.street}</span>
          <span>{address.city}, {address.postal_code}</span>
          <span>{address.country}</span>
        </address>

        <p className="zab-detail-label zab-detail-label--phone">Delivery phone</p>
        <p className="zab-phone">{address.phone_number}</p>
      </div>

      {isConfirmingDelete ? (
        <div className="zab-delete-confirm" role="alert">
          <p>Remove <strong>{address.title}</strong> from this preview?</p>
          <div>
            <button type="button" className="zab-text-button" onClick={onCancelDelete}>
              Keep address
            </button>
            <button type="button" className="zab-delete-confirm-button" onClick={onConfirmDelete}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="zab-card-actions">
          <button type="button" className="zab-text-button" onClick={onEdit}>
            Edit
          </button>
          {!address.is_default && (
            <button type="button" className="zab-text-button" onClick={onSetDefault}>
              Set as default
            </button>
          )}
          <button
            type="button"
            className="zab-text-button zab-delete-button"
            onClick={onDelete}
          >
            Remove
          </button>
        </div>
      )}
    </article>
  );
}

function AddressField({
  name,
  label,
  value,
  error,
  autoComplete,
  maxLength,
  type = "text",
  wide = false,
  onChange,
}) {
  const errorId = `zab-error-${name}`;
  return (
    <label className={`zab-field${wide ? " is-wide" : ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
      />
      {error && <small id={errorId}>{error}</small>}
    </label>
  );
}

export default function Addresses() {
  const { user } = useContext(AuthContext);
  const ownerId = user?.user_id ?? null;
  const [addresses, setAddresses] = useState([]);
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_ADDRESS);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
      async function fetchAddresses() {
        if (ownerId === null) {
          setAddresses([]);
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/api/addresses`, { credentials: "include" });
          const data = await response.json();
          if (response.ok) setAddresses(data.result);
        } catch (error) {
          console.error("Fetch error:", error);
        }
      }
      fetchAddresses();
    }, [ownerId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!formMode && confirmingDeleteId === null) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setFormMode(null);
        setEditingId(null);
        setFormErrors({});
        setFormMessage("");
        setConfirmingDeleteId(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmingDeleteId, formMode]);

  const ownedAddresses = addresses.filter((address) => address.user_id === ownerId);
  const defaultAddress = ownedAddresses.find((address) => address.is_default);
  const accountName = getAccountName(user);

  function closeForm() {
    setFormMode(null);
    setEditingId(null);
    setFormValues(EMPTY_ADDRESS);
    setFormErrors({});
    setFormMessage("");
  }

  function openCreateForm() {
    setFormMode("create");
    setEditingId(null);
    setFormValues({ ...EMPTY_ADDRESS, is_default: ownedAddresses.length === 0 });
    setFormErrors({});
    setFormMessage("");
    setConfirmingDeleteId(null);
  }

  function openEditForm(address) {
    if (address.user_id !== ownerId) return;
    setFormMode("edit");
    setEditingId(address.address_id);
    setFormValues({
      title: address.title,
      street: address.street,
      city: address.city,
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number,
      is_default: address.is_default,
    });
    setFormErrors({});
    setFormMessage("");
    setConfirmingDeleteId(null);
  }

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setFormValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormErrors((current) => ({ ...current, [name]: "" }));
  }

  function saveAddress(event) {
      event.preventDefault();
      if (ownerId === null) {
        setFormMessage("Your account could not be identified.");
        return;
      }

      const nextErrors = validateAddress(formValues);
      setFormErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      const isEditing = formMode === "edit";
      const url = isEditing ? `${API_BASE_URL}/api/addresses/${editingId}` : `${API_BASE_URL}/api/addresses`;
      const method = isEditing ? "PATCH" : "POST";

      fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      })
        .then((res) => res.json())
        .then((data) => {
          if (isEditing) {
            setAddresses((current) => current.map((addr) => (addr.address_id === editingId ? data.result : addr)));
          } else {
            setAddresses((current) => [...current, data.result]);
          }
          setNotice(`Address ${isEditing ? "updated" : "added"} successfully.`);
          closeForm();
        })
        .catch(() => setFormMessage("Failed to save address."));
    }

  function setDefaultAddress(address) {
      fetch(`${API_BASE_URL}/api/addresses/${address.address_id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      })
        .then((res) => res.json())
        .then(() => {
          setAddresses((current) => current.map((item) => ({
            ...item,
            is_default: item.address_id === address.address_id
          })));
          setNotice(`${address.title} set as default.`);
        });
    }

  function removeAddress(address) {
      fetch(`${API_BASE_URL}/api/addresses/${address.address_id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            setAddresses((current) => current.filter((a) => a.address_id !== address.address_id));
            setNotice(`${address.title} removed.`);
          }
        });
    }

  return (
    <div className="zab-page">
      <div className="zab-announcement">
        <span>A considered place for every destination</span>
        <i aria-hidden="true" />
        <span>Local preview " not saved to your account</span>
      </div>

      <header className="zab-header">
        <Link className="zab-wordmark" to="/shop" aria-label="ZENTO, back to shop">
          ZENTO<span>.</span>
        </Link>
        <nav className="zab-header-nav" aria-label="Main navigation">
          <Link to="/shop">Collection</Link>
          <Link to="/cart">Your bag</Link>
          <Link to="/account">Account</Link>
        </nav>
        <CartButton className="zab-cart-trigger" />
      </header>

      <main className="zab-main">
        <div className="zab-breadcrumbs">
          <Link to="/account">Account</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Addresses</span>
        </div>

        <section className="zab-intro" aria-labelledby="zab-page-title">
          <div className="zab-intro-copy">
            <p className="zab-eyebrow">Your account / 03 " Personal destinations</p>
            <h1 id="zab-page-title">A place for every <em>where.</em></h1>
            <p>
              Keep the places you call yours close at hand. Each address is ready
              when you need it.
            </p>
          </div>
          <div className="zab-intro-count" aria-label={`${ownedAddresses.length} saved addresses`}>
            <span className="zab-count-orbit" aria-hidden="true"><PinIcon /></span>
            <strong>{String(ownedAddresses.length).padStart(2, "0")}</strong>
            <span>{ownedAddresses.length === 1 ? "saved address" : "saved addresses"}</span>
          </div>
          <div className="zab-intro-caption">
            <span>ADDRESS BOOK / {String(ownedAddresses.length).padStart(2, "0")}</span>
            <span>For {accountName}</span>
          </div>
        </section>

        <div className="zab-dashboard">
          <aside className="zab-sidebar" aria-label="Account navigation">
            <p className="zab-sidebar-label">Your account</p>
            <nav className="zab-side-nav">
              <Link to="/account"><span>01</span> Profile</Link>
              <Link to="/account#orders"><span>02</span> Orders</Link>
              <Link
                className="is-active"
                to="/account/addresses"
                aria-current="page"
              >
                <span>03</span> Addresses
              </Link>
              <Link to="/cart"><span>04</span> Shopping bag</Link>
            </nav>
            <div className="zab-sidebar-note">
              <span className="zab-note-dot" aria-hidden="true" />
              <p>
                <strong>Only your places.</strong>
                <span>Addresses shown here belong to your signed-in account preview.</span>
              </p>
            </div>
            <Link className="zab-back-account" to="/account">
              Back to account <ArrowIcon />
            </Link>
          </aside>

          <div className="zab-content">
            <div className="zab-section-heading">
              <div>
                <p className="zab-eyebrow">Saved destinations</p>
                <h2>Your address book.</h2>
              </div>
              <button
                className="zab-add-button"
                type="button"
                onClick={openCreateForm}
                disabled={ownerId === null}
              >
                <span aria-hidden="true">+</span> Add an address
              </button>
            </div>

            <p className="zab-preview-note" role="note">
              <span aria-hidden="true">i</span>
              Changes on this page are a local preview only; nothing is written to your account.
            </p>

            {notice && <p className="zab-toast" role="status">{notice}</p>}

            {ownerId === null ? (
              <div className="zab-empty-state" role="alert">
                <span className="zab-empty-mark" aria-hidden="true"><PinIcon /></span>
                <p className="zab-eyebrow">Your account</p>
                <h2>We couldn't identify your address book.</h2>
                <p>Please return to your account and sign in again.</p>
                <Link className="zab-primary-button" to="/account">Back to account <ArrowIcon /></Link>
              </div>
            ) : formMode ? (
              <section className="zab-form-panel" aria-labelledby="zab-form-title">
                <div className="zab-form-heading">
                  <div>
                    <p className="zab-eyebrow">{formMode === "edit" ? "Edit destination" : "A new destination"}</p>
                    <h2 id="zab-form-title">
                      {formMode === "edit" ? "Refine this address." : "Add a place to your book."}
                    </h2>
                    <p>Recipient name and email come from your account. Address details match the saved-address fields.</p>
                  </div>
                  <button className="zab-text-button" type="button" onClick={closeForm}>
                    Cancel
                  </button>
                </div>

                {formMessage && <p className="zab-form-message" role="alert">{formMessage}</p>}
                {Object.keys(formErrors).length > 0 && (
                  <p className="zab-form-message" role="alert">
                    Please correct the highlighted fields before continuing.
                  </p>
                )}

                <form className="zab-form" onSubmit={saveAddress} noValidate>
                  <AddressField
                    name="title"
                    label="Address label"
                    value={formValues.title}
                    error={formErrors.title}
                    maxLength={50}
                    autoComplete="off"
                    onChange={updateField}
                  />
                  <AddressField
                    name="phone_number"
                    label="Delivery phone"
                    value={formValues.phone_number}
                    error={formErrors.phone_number}
                    type="tel"
                    autoComplete="tel"
                    onChange={updateField}
                  />
                  <AddressField
                    name="street"
                    label="Street address"
                    value={formValues.street}
                    error={formErrors.street}
                    maxLength={150}
                    autoComplete="street-address"
                    wide
                    onChange={updateField}
                  />
                  <AddressField
                    name="city"
                    label="City"
                    value={formValues.city}
                    error={formErrors.city}
                    maxLength={50}
                    autoComplete="address-level2"
                    onChange={updateField}
                  />
                  <AddressField
                    name="postal_code"
                    label="Postal code"
                    value={formValues.postal_code}
                    error={formErrors.postal_code}
                    maxLength={20}
                    autoComplete="postal-code"
                    onChange={updateField}
                  />
                  <AddressField
                    name="country"
                    label="Country"
                    value={formValues.country}
                    error={formErrors.country}
                    maxLength={50}
                    autoComplete="country-name"
                    wide
                    onChange={updateField}
                  />
                  <label className="zab-default-check">
                    <input
                      name="is_default"
                      type="checkbox"
                      checked={formValues.is_default}
                      onChange={updateField}
                    />
                    <span>Use as my default address</span>
                  </label>
                  <div className="zab-form-actions">
                    <button className="zab-primary-button" type="submit">
                      {formMode === "edit" ? "Update preview" : "Add to preview"} <ArrowIcon />
                    </button>
                    <button className="zab-cancel-button" type="button" onClick={closeForm}>
                      Cancel
                    </button>
                    <span>Preview only " not saved</span>
                  </div>
                </form>
              </section>
            ) : ownedAddresses.length === 0 ? (
              <div className="zab-empty-state">
                <span className="zab-empty-mark" aria-hidden="true"><PinIcon /></span>
                <p className="zab-eyebrow">Room for somewhere new</p>
                <h2>Your address book is still open.</h2>
                <p>Add a destination to begin arranging your personal address book.</p>
                <button className="zab-primary-button" type="button" onClick={openCreateForm}>
                  Add your first address <ArrowIcon />
                </button>
              </div>
            ) : (
              <>
                {defaultAddress && (
                  <p className="zab-default-summary">
                    <span aria-hidden="true">?</span>
                    <span><strong>{defaultAddress.title}</strong> is your default destination in this preview.</span>
                  </p>
                )}
                <div className="zab-address-grid">
                  {ownedAddresses.map((address) => (
                    <AddressCard
                      key={address.address_id}
                      address={address}
                      accountName={accountName}
                      email={user?.email}
                      isConfirmingDelete={confirmingDeleteId === address.address_id}
                      onEdit={() => openEditForm(address)}
                      onDelete={() => {
                        setConfirmingDeleteId(address.address_id);
                        setFormMode(null);
                        setEditingId(null);
                      }}
                      onCancelDelete={() => setConfirmingDeleteId(null)}
                      onConfirmDelete={() => removeAddress(address)}
                      onSetDefault={() => setDefaultAddress(address)}
                    />
                  ))}
                  <button className="zab-add-card" type="button" onClick={openCreateForm}>
                    <span className="zab-add-card-mark" aria-hidden="true">+</span>
                    <strong>Somewhere new.</strong>
                    <span>Add another address to your book</span>
                    <span className="zab-add-card-link">Add an address <ArrowIcon /></span>
                  </button>
                </div>
              </>
            )}

            <div className="zab-schema-note">
              <span className="zab-schema-mark" aria-hidden="true">Z.</span>
              <p>
                Address records include a label, street, city, postal code, country,
                delivery phone and default setting. Recipient name and email are read
                from your signed-in account.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="zab-footer">
        <Link className="zab-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>LESS, BUT BETTER.</span>
        <Link to="/account">Back to your account <ArrowIcon /></Link>
      </footer>
    </div>
  );
}
