import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './auth.css';

const SelectUsername: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [message, setMessage] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'invalid' | null>(null);
  const [oauthData, setOauthData] = useState<{
    provider: string;
    email: string;
    displayName: string;
    suggestedUsername: string;
  } | null>(null);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Fetch OAuth user data
    const fetchOAuthData = async () => {
      try {
        const response = await api.get('/api/auth/oauth/user-data');

        const data = response.data;
        setOauthData(data);
        setUsername(data.suggestedUsername);
      } catch (error) {
        console.error('Error fetching OAuth data:', error);
        navigate('/login');
      }
    };

    fetchOAuthData();
  }, [navigate]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const response = await api.post('/api/auth/oauth/check-username', { username });
        const data = response.data;
        if (data.available) {
          setUsernameStatus('available');
        } else if (data.error === 'Username is already taken') {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('invalid');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('invalid');
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus !== 'available') {
      setMessage('Please choose an available username');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/auth/oauth/complete', { username });
      
      setMessage('Registration completed! Redirecting...');
      
      // Refresh auth status to pick up the new JWT cookie
      await refreshUser();
      
      // Redirect to home after successful registration
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Error: Unable to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSuggested = () => {
    if (oauthData?.suggestedUsername) {
      setUsername(oauthData.suggestedUsername);
    }
  };

  const getStatusIcon = () => {
    if (isCheckingAvailability) {
      return <span className="status-icon checking">⏳</span>;
    }
    
    switch (usernameStatus) {
      case 'available':
        return <span className="status-icon available">✓</span>;
      case 'taken':
      case 'invalid':
        return <span className="status-icon unavailable">✗</span>;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (isCheckingAvailability) return 'Checking availability...';
    
    switch (usernameStatus) {
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      case 'invalid':
        return 'Username must start with a letter and contain only letters, numbers, and underscores';
      default:
        return '';
    }
  };

  if (!oauthData) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
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
            <h1>Choose Your Username</h1>
            <p>Complete your {oauthData.provider} registration by selecting a username</p>
          </div>

          <div className="oauth-user-info">
            <p><strong>Signing in as:</strong> {oauthData.displayName}</p>
            <p><strong>Email:</strong> {oauthData.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="username-input-container">
                <input
                  type="text"
                  className={`form-input ${usernameStatus === 'available' ? 'valid' : usernameStatus ? 'invalid' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
                {getStatusIcon()}
              </div>
              
              {username && (
                <div className={`username-status ${usernameStatus}`}>
                  {getStatusMessage()}
                </div>
              )}

              <div className="username-help">
                <p>• Must be 3-20 characters long</p>
                <p>• Must start with a letter</p>
                <p>• Can contain letters, numbers, and underscores</p>
              </div>

              {oauthData.suggestedUsername !== username && (
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={handleUseSuggested}
                  disabled={isLoading}
                >
                  Use suggested: {oauthData.suggestedUsername}
                </button>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={isLoading || usernameStatus !== 'available'}
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectUsername;