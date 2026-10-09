import { useState } from "react";
import "../LoginForm.css";
import "../RegisterForm.css";
import { useNavigate } from "react-router-dom";
import {
  MailIcon,
  PhoneIcon,
  UserIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowIcon,
  TruckIcon,
  ShieldIcon,
  HeadsetIcon,
  GoogleIcon,
  AppleIcon,
} from "./AuthIcons";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}
// ===== Validation functions (matching your Zod schemas) =====

function validateFirstName(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return "First name must be at least 2 characters";
  if (trimmed.length > 50) return "First name cannot exceed 50 characters";
  return null;
}

function validateLastName(value) {
  const trimmed = value.trim();
  if (trimmed.length < 2) return "Last name must be at least 2 characters";
  if (trimmed.length > 50) return "Last name cannot exceed 50 characters";
  return null;
}

function validateEmail(value) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "Email is required";
  // Simple but effective email regex (close to Zod's .email())
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return "Invalid email address format";
  return null;
}

function validatePhone(value) {
  const trimmed = value.trim();
  if (trimmed.length < 8) return "Phone number is too short";
  if (trimmed.length > 20) return "Phone number is too long";

  // Same regex as your Zod schema
  if (!/^[0-9\s()+-]+$/.test(trimmed)) {
    return "Phone number contains invalid characters";
  }
  return null;
}

function validatePassword(value) {
  if (value.length < 8) return "Password must be at least 8 characters long";
  if (value.length > 255) return "Password cannot exceed 255 characters";
  if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(value)) return "Password must contain at least one number";
  if (!/[^a-zA-Z0-9]/.test(value)) {
    return "Password must contain at least one special character (e.g., !, @, #, $)";
  }
  return null;
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}
function validateRole(value) {
  const allowedRoles = ["CUSTOMER", "DELIVERY"];
  if (!allowedRoles.includes(value)) {
    return "Role must be either CUSTOMER or DELIVERY";
  }
  return null;
}

export function RegisterForm(props) {
  // UI-only state: show/hide password fields and the time-based greeting
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [greeting] = useState(getGreeting);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target; // ← THIS WAS MISSING
    setServerError(null);

    const data = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      phoneNumber: form.phone_number.value.trim(), // ← fixed name
      email: form.email.value.trim().toLowerCase(), // ← lowercased
      password: form.password.value,
      confirmPassword: form.confirmPassword.value,
      role: form.role.value,
    };

    const errors = {
      firstName: validateFirstName(data.firstName),
      lastName: validateLastName(data.lastName),
      phoneNumber: validatePhone(data.phoneNumber),
      email: validateEmail(data.email),
      password: validatePassword(data.password),
      confirmPassword: validateConfirmPassword(data.password, data.confirmPassword),
      role: validateRole(data.role),
    };

    const isValid = Object.values(errors).every((error) => error === null);

    if (!isValid) {
      setFormErrors(errors);   // ← save the errors
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});


    try {
      const request = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber,
          password: data.password,
          role: data.role,
        }),
      });

      // Parse the response body before checking whether the request succeeded
      const response = await request.json();

      if (!request.ok) {
        console.error("Backend error:", response);
        setServerError(
          response.message || "Something went wrong. Please try again."
        );
        return;
      }

      // Success!
      console.log("Account created:", response);
      navigate("/login");

      // Later: redirect to login or dashboard
    } catch (err) {
      console.error("Request failed:", err);
      setServerError(
        "Unable to contact the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }

  }


  return (
    <div className="lf">
      <aside className="lf-aside">
        <div className="lf-photo" aria-hidden="true" />
        <p className="lf-logo">{props.BRAND}</p>

        <div>
          <p className="lf-eyebrow">Join today</p>
          <h2 className="lf-headline">
            The smarter
            <br />
            way to shop
            <br />
            starts here.
          </h2>
          <p className="lf-copy">
            Create a free {props.BRAND} account to save your favorites, track
            orders and check out faster.
          </p>
        </div>

        <div className="lf-trust">
          <div>
            <TruckIcon size={22} />
            <span>
              Fast &amp; Reliable
              <br />
              Delivery
            </span>
          </div>
          <div>
            <ShieldIcon size={22} />
            <span>
              Secure
              <br />
              Payments
            </span>
          </div>
          <div>
            <HeadsetIcon size={22} />
            <span>
              24/7
              <br />
              Support
            </span>
          </div>
        </div>
      </aside>

      <main className="lf-main">
        <p className="lf-top">
          <span>Already have an account?</span>
          <a href="/login">Sign in</a>
        </p>

        {/* TODO: add your onSubmit handler to this form */}
        <form className="lf-form" name="Form" onSubmit={handleSubmit}>
          <h1 className="lf-title">{greeting}</h1>
          <p className="lf-sub">Create your {props.BRAND} account in a minute.</p>

          <fieldset className="lf-fieldset">
            <legend>I'm signing up as</legend>

            <div className="lf-roles">
              <label className="lf-role">
                <input
                  type="radio"
                  name="role"
                  value="CUSTOMER"
                  defaultChecked
                  required
                />
                <span className="lf-role-body">
                  <span className="lf-role-icon">
                    <UserIcon size={18} />
                  </span>
                  <span className="lf-role-text">
                    <strong>Customer</strong>
                    <span>Shop and order</span>
                  </span>
                </span>
              </label>

              <label className="lf-role">
                <input type="radio" name="role" value="DELIVERY" required />
                <span className="lf-role-body">
                  <span className="lf-role-icon">
                    <TruckIcon size={18} />
                  </span>
                  <span className="lf-role-text">
                    <strong>Delivery</strong>
                    <span>Deliver orders</span>
                  </span>
                </span>
              </label>
              {formErrors.role && (
                <p className="lf-error">{formErrors.role}</p>
              )}
            </div>
          </fieldset>

          <div className="lf-row-2">
            <div className="lf-field">
              <label htmlFor="rf-first">First name</label>
              <div className="lf-input lf-input--plain">
                <input
                  id="rf-first"
                  name="firstName"
                  type="text"
                  placeholder="Sara"
                  autoComplete="given-name"
                  required
                />
              </div>
              {formErrors.firstName && (
                <p className="lf-error">{formErrors.firstName}</p>
              )}
            </div>

            <div className="lf-field">
              <label htmlFor="rf-last">Last name</label>
              <div className="lf-input lf-input--plain">
                <input
                  id="rf-last"
                  name="lastName"
                  type="text"
                  placeholder="Ben Ali"
                  autoComplete="family-name"
                  required
                />
              </div>
              {formErrors.lastName && (
                <p className="lf-error">{formErrors.lastName}</p>
              )}
            </div>

          </div>

          <div className="lf-field">
            <label htmlFor="rf-email">Email address</label>
            <div className="lf-input">
              <MailIcon className="lf-lead" />
              <input
                id="rf-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            {formErrors.email && (
              <p className="lf-error">{formErrors.email}</p>
            )}

          </div>

          <div className="lf-field">
            <label htmlFor="rf-phone">Phone number</label>
            <div className="lf-input">
              <PhoneIcon className="lf-lead" />
              <input
                id="rf-phone"
                name="phone_number"
                type="tel"
                placeholder="+1 555 123 4567"
                autoComplete="tel"
                required
              />
            </div>
            {formErrors.phoneNumber && (
              <p className="lf-error">{formErrors.phoneNumber}</p>
            )}
          </div>

          <div className="lf-field">
            <label htmlFor="rf-password">Password</label>
            <div className="lf-input">
              <LockIcon className="lf-lead" />
              <input
                id="rf-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className="lf-hint">Use at least 8 characters.</p>
            {formErrors.password && (
              <p className="lf-error">{formErrors.password}</p>
            )}
          </div>

          <div className="lf-field">
            <label htmlFor="rf-confirm">Confirm password</label>
            <div className="lf-input">
              <LockIcon className="lf-lead" />
              <input
                id="rf-confirm"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={
                  showConfirm ? "Hide confirm password" : "Show confirm password"
                }
                aria-pressed={showConfirm}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="lf-error">{formErrors.confirmPassword}</p>
            )}
          </div>

          <label className="lf-terms" htmlFor="rf-terms">
            <input id="rf-terms" name="terms" type="checkbox" required />
            <span>
              I agree to the <a href="/terms">Terms</a> and{" "}
              <a href="/privacy">Privacy Policy</a>
            </span>
          </label>

          {/* error message goes here, e.g. <p className="lf-error" role="alert">...</p> */}
          {serverError && (
            <p className="lf-error" role="alert">
              {serverError}
            </p>
          )}

          <button
            className={`lf-submit ${isSubmitting ? "is-loading" : ""}`}
            type="submit"
            disabled={isSubmitting}
          >
            <span className="lf-submit-label">
              {isSubmitting ? "Creating account..." : "Create account"}
            </span>

            <span className="lf-submit-icon">
              {isSubmitting ? (
                <span className="lf-spinner"></span>
              ) : (
                <ArrowIcon size={18} />
              )}
            </span>
          </button>

          <p className="lf-divider">or sign up with</p>

          <button type="button" className="lf-social">
            <GoogleIcon />
            Sign up with Google
          </button>
          <button type="button" className="lf-social">
            <AppleIcon />
            Sign up with Apple
          </button>
        </form>
      </main>
    </div>
  );
}