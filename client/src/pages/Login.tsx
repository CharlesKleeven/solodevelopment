import React, { useState } from 'react';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authAPI.login({ emailOrUsername, password });
      setMessage('Login successful!');
    } catch (error: any) {
      if (error.response?.data?.details) {
        // Show specific validation errors
        const errorMessages = error.response.data.details.map((err: any) => err.msg).join(', ');
        setMessage('Error: ' + errorMessages);
      } else {
        setMessage('Error: ' + (error.response?.data?.error || 'Login failed'));
      }
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email or username:</label><br />
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <label>Password:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;