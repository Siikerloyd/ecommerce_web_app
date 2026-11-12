import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartButton from "../../cart/components/CartButton";
import { useCart } from "../../cart/hooks/useCart";
import { checkoutPaymentMethods } from "../mock/checkout";
import "./checkout.css";

const STEPS = ["Delivery", "Payment", "Review"];
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Formats numeric prices consistently for the checkout UI.
function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

// Renders the small arrow used by checkout navigation buttons.
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

// Renders a check mark for completed checkout steps.
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

// Collects an address and validates it before passing it to the parent.
function AddressForm({ onSave, onCancel }) {
  // Holds the values currently typed into the address form.
  const [values, setValues] = useState({
    title: "",
    street: "",
    city: "",
    postal_code: "",
    country: "",
    phone_number: "",
    is_default: false,
  });
  // Holds validation messages, keyed by the corresponding input name.
  const [errors, setErrors] = useState({});

  // Updates one form value and clears that field's old validation message.
  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  // Prevents submission when required address fields are invalid.
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
        <span>Use as my default address</span>
      </label>
      <div className="zc-form-actions">
        <button className="zc-button zc-button-dark" type="submit">
          Save address
        </button>
      </div>
    </form>
  );
}

// Renders one product in the order summary.
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

// Shows checkout stages and lets the user return to completed stages.
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

// Owns checkout state, loads saved addresses, and renders the checkout stages.
export default function Checkout() {
  const {
    items,
    itemCount,
    subtotal,
    isCartLoading,
    cartError,
    retryCartSync,
    refreshRemoteCart,
  } = useCart();
  // Stores addresses returned by the authenticated GET /api/addresses endpoint.
  const [addresses, setAddresses] = useState([]);
  // Stores the ID of the address currently selected for this checkout.
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  // Stores the payment method that will be recorded as pending with the order.
  const [selectedPayment, setSelectedPayment] = useState("CASH_ON_DELIVERY");
  // Tracks which checkout stage is visible: delivery, payment, or review.
  const [activeStep, setActiveStep] = useState(1);
  // Controls whether the new-address form is shown.
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  // Holds checkout validation, request errors, and order success messages.
  const [checkoutNotice, setCheckoutNotice] = useState("");
  // Indicates that the saved-address request is still in progress.
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  // Holds an error message if the saved-address request fails.
  const [addressError, setAddressError] = useState("");

  const [createdOrder, setCreatedOrder] = useState(null);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Loads this signed-in user's addresses once when Checkout first appears.
  useEffect(() => {
    let isMounted = true;

    // Requests the address list and puts the server response into React state.
    async function getAddresses() {
      setIsAddressLoading(true);
      setAddressError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/addresses`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Could not load addresses (${response.status}).`);
        }
        if (!Array.isArray(data.result)) {
          throw new Error("The addresses response was not in the expected format.");
        }
        if (!isMounted) return;

        setAddresses(data.result);
        const defaultAddress = data.result.find((address) => address.is_default);
        setSelectedAddressId(defaultAddress?.address_id ?? null);
      } catch (error) {
        if (!isMounted) return;

        console.error("Could not load checkout addresses:", error);
        setAddressError(
          error instanceof Error ? error.message : "Could not load addresses.",
        );
      } finally {
        if (isMounted) setIsAddressLoading(false);
      }
    }

    getAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedAddress = addresses.find(
    (address) => address.address_id === selectedAddressId,
  );
  const isCheckoutUnavailable =
    isCartLoading || Boolean(cartError) || items.length === 0;

  // Saves the form address through the API and selects the address returned by the server.
  async function saveAddress(address) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Could not save address (${response.status}).`);
      }
      if (!data.result?.address_id) {
        throw new Error("The saved address was not returned in the expected format.");
      }

      const savedAddress = data.result;
      setAddresses((currentAddresses) => [
        ...currentAddresses.map((currentAddress) => ({
          ...currentAddress,
          is_default: savedAddress.is_default
            ? false
            : currentAddress.is_default,
        })),
        savedAddress,
      ]);
      setSelectedAddressId(savedAddress.address_id);
      setIsAddressFormOpen(false);
      setCheckoutNotice("");
    } catch (error) {
      console.error("Could not save checkout address:", error);
      setCheckoutNotice(
        error instanceof Error ? error.message : "Could not save address.",
      );
    }
  }

  // Requires an address selection before showing the payment stage.
  function continueToPayment() {
    if (!selectedAddress) {
      setCheckoutNotice("Choose or add a delivery address to continue.");
      return;
    }
    setCheckoutNotice("");
    setActiveStep(2);
  }

  // Changes the visible stage and clears any old checkout notice.
  function goToStep(step) {
    setCheckoutNotice("");
    setActiveStep(step);
  }

  // Requires a payment selection before showing the review stage.
  function continueToReview() {
    if (!selectedPayment) {
      setCheckoutNotice("Choose a payment method to continue.");
      return;
    }
    setCheckoutNotice("");
    setActiveStep(3);
  }

  // Creates an order from the signed-in user's backend cart and selected address.
  async function showConfirmation() {
    if (!selectedAddressId) {
      setCheckoutNotice("Choose a delivery address before placing your order.");
      return;
    }

    if (isSubmittingOrder || createdOrder) return;

    setIsSubmittingOrder(true);
    setCheckoutNotice("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address_id: Number(selectedAddressId),
          payment_method: selectedPayment,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Could not create order (${response.status}).`);
      }
      if (!data.result?.order) {
        throw new Error("The order response was not in the expected format.");
      }

      setCreatedOrder(data.result);

      try {
        await refreshRemoteCart();
      } catch (error) {
        console.error("Order was created, but the cart could not be refreshed:", error);
        setCheckoutNotice(
          "Your order was created, but your bag could not refresh. Reload the page to check it.",
        );
      }
    } catch (error) {
      console.error("Could not create checkout order:", error);
      setCheckoutNotice(
        error instanceof Error ? error.message : "Could not create your order.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }

  }

  return (
    <div className="zc-page">
      <div className="zc-announcement">
        <span>Considered objects</span>
        <i aria-hidden="true" />
        <span>Payment choice is recorded · payment is not processed</span>
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

        {!createdOrder && !isCartLoading && cartError && items.length === 0 ? (
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
        ) : createdOrder ? (
          <section className="zc-empty" aria-labelledby="zc-order-confirmed-title">
            <span className="zc-empty-mark" aria-hidden="true">Z.</span>
            <div>
              <p className="zc-kicker">Order received</p>
              <h2 id="zc-order-confirmed-title">Thank you. It’s in our hands.</h2>
              <p>
                Order {createdOrder.order.order_number} was created.
                Payment is pending and has not been processed. Delivery is not
                included in the order total.
              </p>
              <div className="zc-review-block">
                <strong>Order total: {formatPrice(createdOrder.order.total_price)}</strong>
                {createdOrder.payment && (
                  <p className="zc-review-note">
                    {checkoutPaymentMethods.find(
                      (method) => method.value === createdOrder.payment.payment_method,
                    )?.title ?? createdOrder.payment.payment_method}
                    {" · "}
                    Payment status: {createdOrder.payment.payment_status}
                  </p>
                )}
                {createdOrder.items.map((item) => (
                  <div className="zc-review-item" key={item.order_item_id}>
                    <span>{item.product_name} <i>×{item.quantity}</i></span>
                    <strong>
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </strong>
                  </div>
                ))}
              </div>
              {checkoutNotice && (
                <p className="zc-message is-error" role="alert">{checkoutNotice}</p>
              )}
              <Link className="zc-button zc-button-dark" to="/shop">
                Return to the collection <ArrowIcon />
              </Link>
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
                  {isAddressLoading && (
                    <p className="zc-message" role="status">Loading saved addresses…</p>
                  )}
                  {addressError && (
                    <p className="zc-message is-error" role="alert">{addressError}</p>
                  )}
                  <fieldset className="zc-address-list">
                    <legend className="zc-sr-only">Choose a delivery address</legend>
                    {!isAddressLoading && addresses.length === 0 && !addressError && (
                      <p>No saved addresses yet. Add one below to continue.</p>
                    )}
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
                        configured shipping quote. Delivery cost is not included in
                        the order total.
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
                    Choose a method to record with your order. It will be saved as
                    pending; this application does not process payments.
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
                    <strong>No payment will be taken here.</strong>
                    <span>
                      Your choice is recorded with the order, but card and PayPal
                      transactions are not processed.
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
                      Saved with the order as pending. No payment is processed.
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
                      disabled={isCheckoutUnavailable || !selectedAddress || !selectedPayment || isSubmittingOrder || Boolean(createdOrder)}
                      onClick={showConfirmation}
                    >
                      {isSubmittingOrder
                        ? "Placing order…"
                        : createdOrder
                          ? "Order placed"
                          : "Place order"}{" "}
                      {!createdOrder && <ArrowIcon />}
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
                  <span>Delivery <small>quoted separately</small></span>
                  <strong>Not calculated</strong>
                </div>
                <div className="zc-summary-total">
                  <span>Items total <small>USD · before delivery</small></span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </div>
              <p className="zc-summary-disclaimer">
                Item prices are from your saved cart. Delivery is not included because
                the backend does not currently calculate a delivery charge.
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
                  <small>Saved as pending · no payment processed</small>
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
