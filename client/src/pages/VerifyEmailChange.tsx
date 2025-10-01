import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './auth.css';

// API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.solodevelopment.org'
  : 'http://localhost:3001';

const VerifyEmailChange: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your new email address...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmailChange(token);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [searchParams]);

  const verifyEmailChange = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-email-change`, {
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
        setMessage(`Email successfully changed to ${data.email}!`);
        // Refresh auth state to reflect new email
        await refreshUser();
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Email verification failed.');
      }
    } catch (error) {
      console.error('Email change verification error:', error);
      setStatus('error');
      setMessage('An error occurred while verifying your email change.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email Verification</h1>
          </div>

          <div className="auth-content">
            {status === 'verifying' && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <p className="success-message">{message}</p>
                <p className="redirect-message">
                  Redirecting to your profile in 3 seconds...
                </p>
                <Link to="/profile" className="btn btn-primary">
                  Go to Profile Now
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="error-state">
                <div className="error-icon">✗</div>
                <p className="error-message">{message}</p>
                <div className="error-actions">
                  <Link to="/profile" className="btn btn-primary">
                    Back to Profile
                  </Link>
                  <Link to="/login" className="btn btn-ghost">
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailChange;