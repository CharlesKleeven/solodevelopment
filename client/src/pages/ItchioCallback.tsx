import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production'
    ? 'https://api.solodevelopment.org'
    : 'http://localhost:3001'
);

const ItchioCallback: React.FC = () => {
  const [message, setMessage] = useState('Authenticating with itch.io...');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract access token and state from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const state = params.get('state');

        if (!accessToken) {
          throw new Error('No access token received from itch.io');
        }

        // Send token and state to backend
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/itchio/callback`,
          {
            access_token: accessToken,
            state: state
          },
          { withCredentials: true }
        );

        // Check if this was a linking operation
        if (response.data.redirectUrl) {
          // Linking flow - redirect to the specified URL
          setMessage(response.data.message || 'Account linked! Redirecting...');
          await refreshUser();
          setTimeout(() => {
            window.location.href = response.data.redirectUrl;
          }, 1000);
        } else if (response.data.user) {
          // Login flow - cookie is set by the backend (httpOnly)
          // Refresh user data in auth context
          await refreshUser();

          // Redirect to home
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          throw new Error('No user data received');
        }
      } catch (err: any) {
        // Log errors only in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Itch.io auth error:', err.message);
        }
        setError(err.response?.data?.error || err.message || 'Authentication failed');
        setTimeout(() => {
          navigate('/login?error=itchio_auth_failed');
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Itch.io Authentication</h1>
            {error ? (
              <div className="auth-message error">
                {error}
                <p style={{ marginTop: '10px' }}>Redirecting to login...</p>
              </div>
            ) : (
              <div className="auth-message">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItchioCallback;