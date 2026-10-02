export function LoginForm() {

  return (
    <form >
      <h1>Sign In</h1>

      <label htmlFor="user-email">Email</label>
      <input
        id="user-email"
        name="email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        required
      />

      <label htmlFor="user-password">Password</label>
      <input
        id="user-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
      />

      <input type="checkbox" id="remember-me" name="remember" />
      <label htmlFor="remember-me">Remember me</label>

      <button type="submit">Sign in</button>

      <p>
        <span>No account?</span> <a href="/signup">Create one</a>
      </p>
    </form>
  );
}