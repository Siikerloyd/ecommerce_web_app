import { useState } from "react";
import { Link } from "react-router-dom";
import CartButton from "../../cart/components/CartButton";
import { useCart } from "../../cart/hooks/useCart";
import {
  checkoutMockAddresses,
  checkoutPaymentMethods,
  mockDeliveryEstimate,
} from "../mock/checkout";
import "./checkout.css";

const STEPS = ["Delivery", "Payment", "Review"];

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
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

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AddressForm({ onSave, onCancel }) {
  const [values, setValues] = useState({
    title: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    phone_number: "",
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const requiredFields = [
      ["title", 50],
      ["street", 150],
      ["city", 50],
      ["postal_code", 20],
      ["country", 50],
    ];

    requiredFields.forEach(([field, maxLength]) => {
      const value = values[field].trim();
      if (!value) nextErrors[field] = "This field is required.";
      else if (value.length > maxLength) {
        nextErrors[field] = `Use ${maxLength} characters or fewer.`;
      }
    });

    const phone = values.phone_number.trim();
    const normalizedPhone = phone.replace(/[\s()+-]/g, "");
    if (!phone) nextErrors.phone_number = "A phone number is required.";
    else if (!/^[0-9\s()+-]+$/.test(phone)) {
      nextErrors.phone_number = "Use digits, spaces, +, parentheses, or hyphens.";
    } else if (normalizedPhone.length < 8 || normalizedPhone.length > 20) {
      nextErrors.phone_number = "Enter between 8 and 20 digits.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSave({ ...values, ...Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ]),
      ) });
    }
  }

  return (
    <form className="zc-address-form" onSubmit={handleSubmit} noValidate>
      <div className="zc-form-heading">
        <div>
          <p className="zc-kicker">New destination</p>
          <h3>Add an address</h3>
        </div>
        <button className="zc-text-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <div className="zc-form-grid">
        <label className="zc-field">
          <span>Address label</span>
          <input
            name="title"
            autoComplete="off"
            maxLength={50}
            value={values.title}
            onChange={updateField}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "zc-error-title" : undefined}
          />
          {errors.title && <small id="zc-error-title">{errors.title}</small>}
        </label>
        <label className="zc-field">
          <span>Phone number</span>
          <input
            name="phone_number"
            type="tel"
            autoComplete="tel"
            value={values.phone_number}
            onChange={updateField}
            aria-invalid={Boolean(errors.phone_number)}
            aria-describedby={errors.phone_number ? "zc-error-phone" : undefined}
          />
          {errors.phone_number && (
            <small id="zc-error-phone">{errors.phone_number}</small>
          )}
        </label>
        <label className="zc-field zc-field-wide">
          <span>Street address</span>
          <input
            name="street"
            autoComplete="street-address"
            maxLength={150}
            value={values.street}
            onChange={updateField}
            aria-invalid={Boolean(errors.street)}
            aria-describedby={errors.street ? "zc-error-street" : undefined}
          />
          {errors.street && <small id="zc-error-street">{errors.street}</small>}
        </label>
        <label className="zc-field">
          <span>City</span>
          <input
            name="city"
            autoComplete="address-level2"
            maxLength={50}
            value={values.city}
            onChange={updateField}
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "zc-error-city" : undefined}
          />
          {errors.city && <small id="zc-error-city">{errors.city}</small>}
        </label>
        <label className="zc-field">
          <span>Postal code</span>
          <input
            name="postal_code"
            autoComplete="postal-code"
            maxLength={20}
            value={values.postal_code}
            onChange={updateField}
            aria-invalid={Boolean(errors.postal_code)}
            aria-describedby={errors.postal_code ? "zc-error-postal" : undefined}
          />
          {errors.postal_code && (
            <small id="zc-error-postal">{errors.postal_code}</small>
          )}
        </label>
        <label className="zc-field zc-field-wide">
          <span>Country</span>
          <input
            name="country"
            autoComplete="country-name"
            maxLength={50}
            value={values.country}
            onChange={updateField}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? "zc-error-country" : undefined}
          />
          {errors.country && <small id="zc-error-country">{errors.country}</small>}
        </label>
      </div>
      <label className="zc-default-check">
        <input
          name="is_default"
          type="checkbox"
          checked={values.is_default}
          onChange={updateField}
        />
        <span>Use as my default address in this preview</span>
      </label>
      <div className="zc-form-actions">
        <button className="zc-button zc-button-dark" type="submit">
          Save address
        </button>
      </div>
    </form>
  );
}

function CheckoutItem({ item }) {
  return (
    <article className="zc-item">
      <Link
        className="zc-item-image"
        to={`/products/${item.product_id}`}
        aria-label={`View ${item.name}`}
      >
        {item.image ? <img src={item.image} alt="" /> : <span>Z.</span>}
      </Link>
      <div className="zc-item-copy">
        <div className="zc-item-heading">
          <div>
            {item.brand && <p>{item.brand}</p>}
            <Link to={`/products/${item.product_id}`}>{item.name}</Link>
          </div>
          <span className="zc-item-quantity" aria-label={`Quantity ${item.quantity}`}>
            ×{item.quantity}
          </span>
        </div>
        <div className="zc-item-bottom">
          <span>{formatPrice(item.price)} each</span>
          <strong>{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
        </div>
      </div>
    </article>
  );
}

function ProgressSteps({ activeStep, onStepChange }) {
  return (
    <nav className="zc-progress" aria-label="Checkout progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isComplete = step < activeStep;
        const isCurrent = step === activeStep;
        return (
          <button
            key={label}
            className={`zc-progress-step${isCurrent ? " is-current" : ""}${isComplete ? " is-complete" : ""}`}
            type="button"
            aria-current={isCurrent ? "step" : undefined}
            disabled={step > activeStep}
            onClick={() => onStepChange(step)}
          >
            <span className="zc-progress-marker">
              {isComplete ? <CheckIcon /> : `0${step}`}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function Checkout() {
  const {
    items,
    itemCount,
    subtotal,
    isCartLoading,
    cartError,
    retryCartSync,
  } = useCart();
  // TODO(wire): Load and save addresses through GET/POST /api/addresses when integration is in scope.
  const [addresses, setAddresses] = useState(checkoutMockAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(
    checkoutMockAddresses.find((address) => address.is_default)?.address_id ?? null,
  );
  const [selectedPayment, setSelectedPayment] = useState("CASH_ON_DELIVERY");
  const [activeStep, setActiveStep] = useState(1);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState("");

  const selectedAddress = addresses.find(
    (address) => address.address_id === selectedAddressId,
  );
  // TODO(wire): Replace this sample amount when the backend defines a customer delivery quote.
  const deliveryEstimate = items.length > 0 ? mockDeliveryEstimate : 0;
  const total = Number(subtotal) + deliveryEstimate;
  const isCheckoutUnavailable =
    isCartLoading || Boolean(cartError) || items.length === 0;

  function saveAddress(address) {
    const nextId = Math.max(0, ...addresses.map((entry) => entry.address_id)) + 1;
    const nextAddresses = addresses.map((entry) => ({
      ...entry,
      is_default: address.is_default ? false : entry.is_default,
    }));
    const newAddress = { ...address, address_id: nextId };
    setAddresses([...nextAddresses, newAddress]);
    setSelectedAddressId(nextId);
    setIsAddressFormOpen(false);
    setCheckoutNotice("");
  }

  function continueToPayment() {
    if (!selectedAddress) {
      setCheckoutNotice("Choose or add a delivery address to continue.");
      return;
    }
    setCheckoutNotice("");
    setActiveStep(2);
  }

  function goToStep(step) {
    setCheckoutNotice("");
    setActiveStep(step);
  }

  function continueToReview() {
    if (!selectedPayment) {
      setCheckoutNotice("Choose a payment method to continue.");
      return;
    }
    setCheckoutNotice("");
    setActiveStep(3);
  }

  function showMockConfirmation() {
    // TODO(wire): Submit the selected address and cart to the authenticated order endpoint.
    // TODO(wire): Connect payment method selection only after a payment flow is implemented.
    setCheckoutNotice(
      "Preview only — no order was created and no payment was taken.",
    );
  }

  return (
    <div className="zc-page">
      <div className="zc-announcement">
        <span>Considered objects</span>
        <i aria-hidden="true" />
        <span>Mock checkout · sample details · no order will be placed</span>
      </div>

      <header className="zc-header">
        <Link className="zc-wordmark" to="/shop" aria-label="ZENTO, back to shop">
          ZENTO<span>.</span>
        </Link>
        <nav className="zc-header-nav" aria-label="Main navigation">
          <Link to="/shop">Collection</Link>
          <Link to="/cart">Your bag</Link>
          <span aria-current="page">Checkout</span>
        </nav>
        <CartButton className="zc-cart-trigger" />
      </header>

      <main className="zc-main">
        <div className="zc-breadcrumbs">
          <Link to="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link to="/cart">Bag</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Checkout</span>
        </div>

        <div className="zc-title-row">
          <div>
            <p className="zc-kicker">A thoughtful final step</p>
            <h1>Make it <em>yours.</em></h1>
          </div>
          <p>Review your details before you go.</p>
        </div>

        <ProgressSteps activeStep={activeStep} onStepChange={goToStep} />

        {cartError && (
          <p className="zc-message is-error" role="alert">
            Your saved cart could not be refreshed. {cartError}{" "}
            <button type="button" onClick={retryCartSync}>Retry sync</button>
          </p>
        )}
        {isCartLoading && (
          <p className="zc-message" role="status">Loading your saved selection…</p>
        )}

        {!isCartLoading && cartError && items.length === 0 ? (
          <section className="zc-empty">
            <span className="zc-empty-mark" aria-hidden="true">Z.</span>
            <div>
              <p className="zc-kicker">Your bag needs a refresh</p>
              <h2>We could not confirm your saved selection.</h2>
              <p>Retry the cart sync before continuing to checkout.</p>
              <button
                className="zc-button zc-button-dark"
                type="button"
                onClick={retryCartSync}
              >
                Retry cart sync <ArrowIcon />
              </button>
            </div>
          </section>
        ) : !isCartLoading && items.length === 0 ? (
          <section className="zc-empty">
            <span className="zc-empty-mark" aria-hidden="true">Z.</span>
            <div>
              <p className="zc-kicker">Your selection is waiting</p>
              <h2>There is nothing to check out just yet.</h2>
              <p>Explore the collection and add something considered to your bag.</p>
              <Link className="zc-button zc-button-dark" to="/shop">
                Return to the collection <ArrowIcon />
              </Link>
            </div>
          </section>
        ) : (
          <div className="zc-layout">
            <div className="zc-flow">
              {activeStep === 1 && (
                <section className="zc-stage" aria-labelledby="zc-delivery-title">
                  <div className="zc-stage-heading">
                    <span className="zc-stage-number">01</span>
                    <div>
                      <p className="zc-kicker">Where should it arrive?</p>
                      <h2 id="zc-delivery-title">Delivery address</h2>
                    </div>
                  </div>
                  <fieldset className="zc-address-list">
                    <legend className="zc-sr-only">Choose a delivery address</legend>
                    {addresses.map((address) => (
                      <label
                        key={address.address_id}
                        className={`zc-address-card${selectedAddressId === address.address_id ? " is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="delivery-address"
                          value={address.address_id}
                          checked={selectedAddressId === address.address_id}
                          onChange={() => {
                            setSelectedAddressId(address.address_id);
                            setCheckoutNotice("");
                          }}
                        />
                        <span className="zc-radio-mark" aria-hidden="true" />
                        <span className="zc-address-copy">
                          <span className="zc-address-title">
                            <strong>{address.title}</strong>
                            {address.is_default && <small>Default</small>}
                          </span>
                          <span>{address.street}</span>
                          <span>{address.city}, {address.postal_code}</span>
                          <span>{address.country}</span>
                          <span className="zc-address-phone">{address.phone_number}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>

                  {isAddressFormOpen ? (
                    <AddressForm
                      onSave={saveAddress}
                      onCancel={() => setIsAddressFormOpen(false)}
                    />
                  ) : (
                    <button
                      className="zc-add-address"
                      type="button"
                      onClick={() => setIsAddressFormOpen(true)}
                    >
                      <span aria-hidden="true">+</span> Add a new address
                    </button>
                  )}

                  <div className="zc-delivery-note">
                    <span className="zc-note-mark" aria-hidden="true">i</span>
                    <p>
                      <strong>Delivery arranged by our team</strong>
                      <span>
                        The project has no customer-selectable delivery service or
                        configured shipping rate. The amount shown is a mock estimate.
                      </span>
                    </p>
                  </div>

                  <div className="zc-stage-actions">
                    <Link className="zc-back-link" to="/cart">← Edit your bag</Link>
                    <button
                      className="zc-button zc-button-dark"
                      type="button"
                      disabled={isCheckoutUnavailable || !selectedAddress}
                      onClick={continueToPayment}
                    >
                      Choose payment <ArrowIcon />
                    </button>
                  </div>
                </section>
              )}

              {activeStep === 2 && (
                <section className="zc-stage" aria-labelledby="zc-payment-title">
                  <div className="zc-stage-heading">
                    <span className="zc-stage-number">02</span>
                    <div>
                      <p className="zc-kicker">How would you like to pay?</p>
                      <h2 id="zc-payment-title">Payment method</h2>
                    </div>
                  </div>
                  <p className="zc-stage-intro">
                    These options match the project’s payment-method schema. Choosing
                    one here is a local preview only; payment is not connected.
                  </p>
                  <fieldset className="zc-payment-list">
                    <legend className="zc-sr-only">Choose a payment method</legend>
                    {checkoutPaymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`zc-payment-card${selectedPayment === method.value ? " is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment-method"
                          value={method.value}
                          checked={selectedPayment === method.value}
                          onChange={() => {
                            setSelectedPayment(method.value);
                            setCheckoutNotice("");
                          }}
                        />
                        <span className="zc-radio-mark" aria-hidden="true" />
                        <span className="zc-payment-marker">{method.marker}</span>
                        <span className="zc-payment-copy">
                          <strong>{method.title}</strong>
                          <small>{method.detail}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div className="zc-payment-disclaimer">
                    <strong>Nothing is charged here.</strong>
                    <span>
                      Payment status and transactions are not handled by this checkout
                      preview.
                    </span>
                  </div>
                  <div className="zc-stage-actions">
                    <button
                      className="zc-back-link"
                      type="button"
                      onClick={() => goToStep(1)}
                    >
                      ← Back to address
                    </button>
                    <button
                      className="zc-button zc-button-dark"
                      type="button"
                      disabled={isCheckoutUnavailable || !selectedPayment}
                      onClick={continueToReview}
                    >
                      Review order <ArrowIcon />
                    </button>
                  </div>
                </section>
              )}

              {activeStep === 3 && (
                <section className="zc-stage" aria-labelledby="zc-review-title">
                  <div className="zc-stage-heading">
                    <span className="zc-stage-number">03</span>
                    <div>
                      <p className="zc-kicker">One last look</p>
                      <h2 id="zc-review-title">Review your order</h2>
                    </div>
                  </div>
                  <div className="zc-review-block">
                    <div className="zc-review-heading">
                      <div>
                        <p className="zc-kicker">Delivering to</p>
                        <strong>{selectedAddress?.title}</strong>
                      </div>
                      <button type="button" onClick={() => goToStep(1)}>Change</button>
                    </div>
                    {selectedAddress && (
                      <address>
                        {selectedAddress.street}<br />
                        {selectedAddress.city}, {selectedAddress.postal_code}<br />
                        {selectedAddress.country}<br />
                        {selectedAddress.phone_number}
                      </address>
                    )}
                  </div>
                  <div className="zc-review-block">
                    <div className="zc-review-heading">
                      <div>
                        <p className="zc-kicker">Payment selection</p>
                        <strong>
                          {checkoutPaymentMethods.find(
                            (method) => method.value === selectedPayment,
                          )?.title}
                        </strong>
                      </div>
                      <button type="button" onClick={() => goToStep(2)}>Change</button>
                    </div>
                    <p className="zc-review-note">
                      Preview selection only. No payment will be taken.
                    </p>
                  </div>
                  <div className="zc-review-block zc-review-items">
                    <div className="zc-review-heading">
                      <div>
                        <p className="zc-kicker">In your bag</p>
                        <strong>{itemCount} {itemCount === 1 ? "piece" : "pieces"}</strong>
                      </div>
                      <Link to="/cart">Edit bag</Link>
                    </div>
                    {items.map((item) => (
                      <div className="zc-review-item" key={item.product_id}>
                        <span>{item.name} <i>×{item.quantity}</i></span>
                        <strong>{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                      </div>
                    ))}
                  </div>
                  {checkoutNotice && (
                    <p className="zc-confirmation-notice" role="status">
                      <span aria-hidden="true">!</span>
                      {checkoutNotice}
                    </p>
                  )}
                  <div className="zc-stage-actions">
                    <button
                      className="zc-back-link"
                      type="button"
                      onClick={() => goToStep(2)}
                    >
                      ← Back to payment
                    </button>
                    <button
                      className="zc-button zc-button-dark"
                      type="button"
                      disabled={isCheckoutUnavailable || !selectedAddress || !selectedPayment}
                      onClick={showMockConfirmation}
                    >
                      Confirm preview <ArrowIcon />
                    </button>
                  </div>
                </section>
              )}

              {checkoutNotice && activeStep !== 3 && (
                <p className="zc-inline-notice" role="alert">{checkoutNotice}</p>
              )}
            </div>

            <aside className="zc-summary" aria-labelledby="zc-summary-title">
              <div className="zc-summary-head">
                <p className="zc-kicker">The considered edit</p>
                <h2 id="zc-summary-title">Your order <span>{String(itemCount).padStart(2, "0")}</span></h2>
              </div>
              <div className="zc-summary-items">
                {items.map((item) => (
                  <CheckoutItem item={item} key={item.product_id} />
                ))}
              </div>
              <div className="zc-summary-costs">
                <div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
                <div>
                  <span>Delivery <small>sample estimate</small></span>
                  <strong>{items.length ? formatPrice(deliveryEstimate) : "—"}</strong>
                </div>
                <div className="zc-summary-total">
                  <span>Estimated total <small>USD · mock</small></span>
                  <strong>{formatPrice(total)}</strong>
                </div>
              </div>
              <p className="zc-summary-disclaimer">
                All amounts are illustrative USD mock values. No shipping rate is
                configured in the project.
              </p>
              {selectedAddress && (
                <div className="zc-summary-detail">
                  <span>Delivering to</span>
                  <strong>{selectedAddress.title}</strong>
                  <small>{selectedAddress.city}, {selectedAddress.country}</small>
                </div>
              )}
              {selectedPayment && (
                <div className="zc-summary-detail">
                  <span>Payment selection</span>
                  <strong>
                    {checkoutPaymentMethods.find(
                      (method) => method.value === selectedPayment,
                    )?.title}
                  </strong>
                  <small>Local preview only</small>
                </div>
              )}
              <div className="zc-summary-foot">
                <span>01</span>
                Thoughtfully chosen. Yours to keep.
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="zc-footer">
        <Link className="zc-wordmark" to="/shop">ZENTO<span>.</span></Link>
        <span>LESS, BUT BETTER.</span>
        <Link to="/cart">Return to your bag <ArrowIcon /></Link>
      </footer>
    </div>
  );
}
