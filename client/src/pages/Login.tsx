import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

// API base URL - adjust for production vs development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.solodevelopment.org' // In production, use API subdomain
  : 'http://localhost:3001'; // In development, use backend port

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, login, register, error, loading, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Clear local message when auth error changes
  useEffect(() => {
    if (error) {
      setMessage(`Error: ${error}`);
    }
  }, [error]);

  // Check for OAuth errors in URL params
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      switch (oauthError) {
        case 'google_auth_failed':
          setMessage('Error: Google authentication failed. Please try again.');
          break;
        case 'discord_auth_failed':
          setMessage('Error: Discord authentication failed. Please try again.');
          break;
        case 'itchio_auth_failed':
          setMessage('Error: Itch.io authentication failed. Please try again.');
          break;
        case 'auth_failed':
          setMessage('Error: Authentication failed. Please try again.');
          break;
        case 'auth_error':
          setMessage('Error: An authentication error occurred. Please try again.');
          break;
        default:
          setMessage('Error: Authentication failed. Please try again.');
      }
      // Clear the error from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('error');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    clearError(); // Clear any existing errors

    try {
      if (isRegistering) {
        await register(username, email, password);
        setMessage('Registration successful! Please check your email to verify your account.');
        // Navigation will happen via useEffect when user state updates
      } else {
        await login(emailOrUsername, password);
        setMessage('Login successful! Redirecting...');
        // Navigation will happen via useEffect when user state updates
      }
    } catch (error: any) {
      // Error is handled by the context and will be displayed via useEffect
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setMessage('');
    // Clear form fields when switching
    setEmailOrUsername('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card loading-card">
            <div className="auth-header loading-only">
              <h1>Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>{isRegistering ? 'Join SoloDevelopment' : 'Welcome Back'}</h1>
            <p>{isRegistering ? 'Create your account to join the community' : 'Sign in to your account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering ? (
              <>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Email or Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="Enter your email or username"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <div className="forgot-password-link">
                    <Link to="/forgot-password">Forgot your password?</Link>
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="oauth-divider">
            <span>Or continue with</span>
          </div>

          <div className="oauth-buttons">
            <a 
              href={`${API_BASE_URL}/api/auth/google`} 
              className="btn btn-oauth btn-google"
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            
            <a
              href={`${API_BASE_URL}/api/auth/discord`}
              className="btn btn-oauth btn-discord"
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
              </svg>
              Continue with Discord
            </a>

            <a
              href={`https://itch.io/user/oauth?client_id=${process.env.REACT_APP_ITCHIO_CLIENT_ID || 'f6842af5baa31d79729430996467e151'}&scope=profile%3Ame&response_type=token&redirect_uri=${encodeURIComponent(`${process.env.REACT_APP_OAUTH_REDIRECT_BASE || window.location.origin}/itchio-callback`)}`}
              className="btn btn-oauth btn-itchio"
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault();
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.13 1.338C2.08 1.96 0 4.328 0 6.254v1.57c0 1.92 1.595 3.578 3.6 3.578 2.016 0 3.6-1.65 3.6-3.578 0 1.928 1.595 3.578 3.6 3.578 2.015 0 3.6-1.65 3.6-3.578 0 1.928 1.584 3.578 3.6 3.578 2.005 0 3.6-1.65 3.6-3.578v-1.57c0-1.926-2.08-4.294-3.13-4.916-.65-.128-1.85-.132-2.37-.132h-13c-.52 0-1.72.004-2.37.132zm6.237 6.24c-.126 1.825-1.695 3.206-3.568 3.206-.64 0-1.24-.206-1.754-.524C4.312 12.15 4.806 14 5.48 14.75c.927 1.038 7.402 1.046 7.52 1.046.118 0 6.593-.008 7.52-1.046.674-.75 1.168-2.6 1.435-4.488a3.424 3.424 0 01-1.754.524c-1.873 0-3.442-1.38-3.568-3.206-.138 1.8-1.706 3.206-3.633 3.206s-3.495-1.406-3.633-3.206zm.433 5.088c-.01-.01-4.345.11-4.345 3.646 0 3.536 5.005 3.536 5.005 8.18 0-4.644 5.006-4.644 5.005-8.18 0-3.536-4.345-3.656-4.345-3.646-.466.47-.946.47-1.32 0z"/>
              </svg>
              Continue with Itch.io
            </a>
          </div>

          {message && (
            <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
              {message.includes('verify your email') && message.includes('before logging in') && (
                <div style={{ marginTop: '10px' }}>
                  <Link to="/verify-email" style={{ color: '#667eea', textDecoration: 'underline' }}>
                    Resend verification email
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="auth-toggle">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-toggle-link"
                disabled={isLoading}
              >
                {isRegistering ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;