import "./LoginForm.css";

export function LoginForm() {
  function handleSubmit(e) {
    e.preventDefault();
    // handle login
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-eyebrow">Welcome back</p>
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Sign in to continue shopping.</p>

        <div className="field">
          <label htmlFor="user-email">Email</label>
          <input
            id="user-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="user-password">Password</label>
          <input
            id="user-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="auth-row">
          <label className="checkbox" htmlFor="remember-me">
            <input type="checkbox" id="remember-me" name="remember" />
            Remember me
          </label>
          <a href="/forgot">Forgot password?</a>
        </div>

        <button className="btn-primary" type="submit">
          Sign in
        </button>

        <p className="auth-footer">
          No account? <a href="/signup">Create one</a>
        </p>
      </form>
    </div>
  );
}