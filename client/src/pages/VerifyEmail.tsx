import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

// API base URL - same pattern as Login.tsx
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.solodevelopment.org'
  : 'http://localhost:3001';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('resend');
      setMessage('No verification token provided. Enter your email to resend verification.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        // Refresh auth state and redirect
        await refreshUser();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Verification email has been resent!');
      } else {
        setMessage(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setMessage('An error occurred while resending verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            {status === 'verifying' && (
              <>
                <h1>Verifying your email...</h1>
                <p>Please wait while we verify your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <h1 style={{ color: '#4ade80' }}>✓ Email Verified!</h1>
                <p>{message}</p>
                <p style={{ fontSize: '14px', opacity: 0.8 }}>Redirecting to home page...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <h1 style={{ color: '#ef4444' }}>✗ Verification Failed</h1>
                <p>{message}</p>
              </>
            )}

            {status === 'resend' && (
              <>
                <h1>Resend Verification Email</h1>
                <p>{message}</p>
              </>
            )}
          </div>

          {status === 'error' && (
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => setStatus('resend')}
                className="btn btn-primary btn-block"
              >
                Resend Verification Email
              </button>
            </div>
          )}

          {status === 'resend' && (
            <form onSubmit={handleResendVerification} className="auth-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-control"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={resendLoading}
                className="btn btn-primary btn-block"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <div className="auth-toggle" style={{ marginTop: '20px' }}>
                <p>
                  <Link to="/login">Back to Login</Link>
                </p>
              </div>
            </form>
          )}

          {(status === 'success' || status === 'verifying') && (
            <div className="auth-toggle" style={{ marginTop: '20px' }}>
              <p>
                <Link to="/login">Back to Login</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;