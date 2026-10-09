import { useState, useContext } from "react";
import "../LoginForm.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


//const BRAND = "ZENTO";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

//email and password verify 
function verifyEmail(email) {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function verifyPassword(password) {
  if (typeof password !== "string") return false;
  return password.length >= 8;
}


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

const MailIcon = (p) => (
  <Icon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);

const LockIcon = (p) => (
  <Icon {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

const EyeIcon = (p) => (
  <Icon {...p}>
    <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

const EyeOffIcon = (p) => (
  <Icon {...p}>
    <path d="M10.73 5.08a10.74 10.74 0 0 1 11.21 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49" />
    <path d="M14.08 14.16a3 3 0 0 1-4.24-4.24" />
    <path d="M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14" />
    <path d="m2 2 20 20" />
  </Icon>
);

const ArrowIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

const TruckIcon = (p) => (
  <Icon {...p}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </Icon>
);

const ShieldIcon = (p) => (
  <Icon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const HeadsetIcon = (p) => (
  <Icon {...p}>
    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
  </Icon>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.15 6.9c-.95 0-2.42-1.08-3.96-1.04-2.04.03-3.91 1.18-4.96 3.01-2.12 3.68-.55 9.1 1.52 12.09 1.01 1.45 2.21 3.09 3.79 3.04 1.52-.07 2.09-.99 3.94-.99 1.83 0 2.35.99 3.96.95 1.64-.03 2.68-1.48 3.68-2.95 1.16-1.69 1.64-3.33 1.66-3.42-.04-.01-3.18-1.22-3.22-4.86-.03-3.04 2.48-4.49 2.6-4.56-1.43-2.09-3.62-2.32-4.39-2.38-2-.16-3.68 1.09-4.61 1.09zM15.53 3.83c.84-1.01 1.4-2.43 1.25-3.83-1.21.05-2.66.8-3.53 1.82-.78.9-1.45 2.34-1.27 3.71 1.34.1 2.72-.69 3.55-1.7" />
  </svg>
);

export function LoginForm(props) {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [greeting] = useState(getGreeting);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser, setToken } = useContext(AuthContext);
  const [serverError, setServerError] = useState(null);
  //redirect 
  const navigate = useNavigate();
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  }
  //handle submitt 
  async function handleSubmit(e) {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    const password = form.password;
    if (!verifyEmail(email) || !verifyPassword(password)) {
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      // Handle backend errors: 401, 400, 500, etc.
      if (!response.ok) {
        console.error("Login error:", data);

        setServerError(
          data.message || `Login failed (${response.status}). Please try again.`
        );

        return;
      }
      // Make sure the successful response contains what we need
      if (!data.user || !data.token) {
        setServerError("Invalid response from server. Please try again.");
        return;
      }

      // Login succeeded
      setUser(data.user);
      setToken(data.token);
      navigate("/home");
    } catch (error) {
      // Network failure, backend offline, invalid JSON, etc.
      console.error("Login request failed:", error);

      setServerError("Unable to contact the server. Please try again.");
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
          <p className="lf-eyebrow">Shop smarter</p>
          <h2 className="lf-headline">
            Everything
            <br />
            you need.
            <br />
            One place.
          </h2>
          <p className="lf-copy">
            From the latest tech to everyday essentials — {props.BRAND} brings the
            world of shopping to you.
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
          <span>Don't have an account?</span>
          <a href="/register">Create one</a>
        </p>

        <form className="lf-form" onSubmit={handleSubmit}  >
          <h1 className="lf-title">{greeting}</h1>
          <p className="lf-sub">Welcome back. Sign in to your {props.BRAND} account.</p>

          <div className="lf-field">
            <label htmlFor="lf-email">Email address</label>
            <div className="lf-input">
              <MailIcon className="lf-lead" />
              <input
                id="lf-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="lf-field">
            <label htmlFor="lf-password">Password</label>
            <div className="lf-input">
              <LockIcon className="lf-lead" />
              <input
                id="lf-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
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
          </div>

          <div className="lf-row">
            <label className="lf-remember" htmlFor="lf-remember">
              <input
                id="lf-remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a className="lf-forgot" href="/forgot-password">
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="lf-error" role="alert">
              {error}
            </p>
          )}

          {serverError && (
            <p role="alert" className="lf-error">
              {serverError}
            </p>
          )}

          <button className={`lf-submit ${isSubmitting ? "is-loading" : ""}`} type="submit" disabled={isSubmitting}>
            <span className="lf-submit-label">{isSubmitting ? "Signing you in" : "Sign in"}</span>
            <span className="lf-submit-icon">
              {isSubmitting ? <span className="lf-spinner" /> : <ArrowIcon size={18} />}
            </span>
          </button>

          <p className="lf-divider">or continue with</p>

          <button type="button" className="lf-social">
            <GoogleIcon />
            Continue with Google
          </button>
          <button type="button" className="lf-social">
            <AppleIcon />
            Continue with Apple
          </button>
        </form>
      </main>
    </div>
  );
}