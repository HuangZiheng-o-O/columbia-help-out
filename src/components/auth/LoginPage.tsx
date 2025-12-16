import { useState, type FC } from 'react';
import { useUser } from '../../context/UserContext';

const LoginPage: FC = () => {
  const { signInWithGoogleAccount } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    const result = await signInWithGoogleAccount();
    
    if (!result.success) {
      setError(result.error ?? 'Sign-in failed. Please try again.');
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
          <h2 className="login-form-title">Sign in to continue</h2>

          {error && (
            <div className="login-error" role="alert">
              <span className="login-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="button"
            className="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Columbia Google'}
          </button>

          <p className="login-hint">
            Use your @columbia.edu email to sign in
          </p>
        </section>

        <footer className="login-footer">
          <p className="login-footer-text">
            Only Columbia University accounts are allowed
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
