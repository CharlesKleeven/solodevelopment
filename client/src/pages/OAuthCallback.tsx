import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Refresh user data to pick up the JWT cookie set by OAuth
        await refreshUser();
        
        // Short delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, refreshUser]);

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Completing Login...</h1>
            <p>Just a moment while we finish signing you in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;