import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './auth.css';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegistering) {
        const response = await authAPI.register({ username, email, password });
        setMessage('Registration successful! You can now log in.');
        setIsRegistering(false);
        // Clear form
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        const response = await authAPI.login({ emailOrUsername, password });
        setMessage('Login successful!');
      }
    } catch (error: any) {
      if (error.response?.data?.details) {
        // Show specific validation errors
        const errorMessages = error.response.data.details.map((err: any) => err.msg).join(', ');
        setMessage('Error: ' + errorMessages);
      } else {
        setMessage('Error: ' + (error.response?.data?.error || (isRegistering ? 'Registration failed' : 'Login failed')));
      }
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
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="auth-toggle">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-toggle-link"
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