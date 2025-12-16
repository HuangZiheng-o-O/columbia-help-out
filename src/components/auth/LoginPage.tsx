import { useState, type FC, type FormEvent } from 'react';
import { useUser } from '../../context/UserContext';

const LoginPage: FC = () => {
  const { authenticate } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const result = authenticate(email, password);
    
    if (!result.success) {
      setError(result.error ?? 'Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <header className="login-header">
          <div className="login-logo">
            <span className="login-logo-icon">🦁</span>
            <h1 className="login-title">Columbia Help Out</h1>
          </div>
          <p className="login-subtitle">
            Credit-based task exchange platform for CU students
          </p>
        </header>

        <section className="login-content">
          <h2 className="login-form-title">Sign in to your account</h2>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error" role="alert">
                <span className="login-error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your.name@columbia.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
        <footer className="login-footer">
          <p className="login-footer-text">
            Currently a Demo App. Demo credentials:
          </p>
          <div className="credentials-grid">
            <span>jordan@columbia.edu / jordan123</span>
            <span>li.andy@columbia.edu / andy123</span>
          </div>
          <div className="credentials-grid">
            <span>sarah.kim@columbia.edu / sarah123</span>
            <span>pat.singh@columbia.edu / pat123</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;

