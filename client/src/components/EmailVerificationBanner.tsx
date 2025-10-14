import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EmailVerificationBanner.css';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    if (user && !user.emailVerified && !isDismissed) {
      setIsVisible(true);
      // Add class to body for padding adjustment
      document.body.classList.add('has-email-banner');
    } else {
      setIsVisible(false);
      // Remove class from body
      document.body.classList.remove('has-email-banner');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('has-email-banner');
    };
  }, [user, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in session storage so it persists during the session
    sessionStorage.setItem('emailVerificationBannerDismissed', 'true');
  };

  // Check session storage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem('emailVerificationBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) return null;

  const hasPlaceholderEmail = user?.email?.includes('@oauth.local');

  return (
    <div className="email-verification-banner">
      <div className="banner-content">
        <div className="banner-message">
          <span className="banner-icon">!</span>
          {hasPlaceholderEmail ? (
            <>
              <span>You need to add an email address to participate in voting.</span>
              <Link to="/verify-email" className="banner-link">
                Set Email Address
              </Link>
            </>
          ) : (
            <>
              <span>Your email is not verified. Verify it to participate in voting.</span>
              <Link to="/verify-email" className="banner-link">
                Verify Email
              </Link>
            </>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="banner-dismiss"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;